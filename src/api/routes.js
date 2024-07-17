/**
 * @file routes.js
 * 
 * @brief This file contains the JavaScript modules
 * for the routes management
 * 
 * @license MIT
 * @author ruxixa
 * @copyright 2024
 */
const express = require("express");
const db = require("../db/db");

/**
 * @class Api
 * @classdesc Class containing the API routes 
 */
class Api {
  /**
   * @brief Gets the authentication credentials from the request
   * 
   * @param {Request} req The request object
   * 
   * @returns {Object} The authentication credentials
   */
  static getAuthCredentials(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Decode the base64-encoded credentials
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64")
      .toString("utf-8")
      .split(":");
      
    const username = credentials[0];
    const password = credentials[1];

    if (!username || !password) {
      return null;
    }

    return { username, password };
  }

  /**
   * @brief Middleware to check the authentication
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * @param {Function} next The next function
   * 
   * @returns {void}
   */
  static checkAuthMiddleware(req, res, next) {
    const credentials = Api.getAuthCredentials(req);

    if (!credentials) {
      return res
        .status(401)
        .json({ message: "No authentication data provided" });
    }

    const { username, password } = credentials;

    db.query(
      "SELECT user_id FROM Users WHERE username = ? AND password_hash = ?",
      [username, password],
      (err, results) => {
        if (err || results.length === 0) {
          return res
            .status(401)
            .json({ message: "Invalid authentication data" });
        }

        next();
      }
    );
  }

  /**
   * @brief Serves the app.html file
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static appRoute(req, res) {
    const appHtmlPath = path.resolve(__dirname, "../../public/app.html");
    res.sendFile(appHtmlPath);
  }

  /**
   * @brief Logs the user in
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static loginRoute(req, res) {
    // Since we have the checkAuthMiddleware, we can assume 
    // that the credentials are correct if we reach this point
    return res.status(204).send();
  }

  /**
   * @brief Gets the user's data
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
    static getMeRoute(req, res) {
      const { username, password } = Api.getAuthCredentials(req);
  
      db.query(
        `SELECT u.user_id, u.username, u.registration_date, u.profile_picture, u.full_name,
                c.conversation_id, c.user1_id, c.user2_id, c.created_at
         FROM Users u
         LEFT JOIN Conversations c ON u.user_id = c.user1_id OR u.user_id = c.user2_id
         WHERE u.username = ? AND u.password_hash = ?`,
        [username, password],
        (err, results) => {
          if (err) {
            return res.status(500).json({ message: "Internal server error" });
          }
  
          if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
          }
  
          const user = {
            user_id: results[0].user_id,
            username: results[0].username,
            registration_date: results[0].registration_date,
            profile_picture: results[0].profile_picture,
            full_name: results[0].full_name,
          };
  
          const conversations = results
            .map((row) => ({
              conversation_id: row.conversation_id,
              user1_id: row.user1_id,
              user2_id: row.user2_id,
              created_at: row.created_at,
            }))
            .filter((convo) => convo.conversation_id !== null);
  
          res.status(200).json({ user, conversations });
        }
      );
    }

  /**
   * @brief Creates a new conversation
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static createConversationRoute(req, res) {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    db.query(
      "SELECT * FROM Conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
      [user1Id, user2Id, user2Id, user1Id],
      (err, results) => {
        if (err) {
          console.error("Error checking conversation:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length > 0) {
          return res.status(201).json({
            conversation_id: results[0].conversation_id,
          });
        }

        db.query(
          "INSERT INTO Conversations (user1_id, user2_id) VALUES (?, ?)",
          [user1Id, user2Id],
          (err, results) => {
            if (err) {
              console.error("Error creating conversation:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            const conversationId = results.insertId;

            res.status(201).json({
              conversation_id: conversationId,
            });
          }
        );
      }
    );
  }

  /**
   * @brief Gets the messages of a conversation
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static getMessagesRoute(req, res) {
    const { conversationId } = req.params;

    db.query(
      "SELECT * FROM Messages WHERE conversation_id = ?",
      [conversationId],
      (err, results) => {
        if (err) {
          console.error("Error fetching messages:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        res.status(200).json(results);
      }
    );
  }

  /**
   * @brief Gets the list of users
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static getUsersRoute(req, res) {
    db.query(
      "SELECT user_id, username, registration_date, profile_picture, full_name FROM Users",
      (err, results) => {
        if (err) {
          console.error("Error fetching users:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        res.status(200).json(results);
      }
    );
  }

  /**
   * @brief Gets the data of a user
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static getAllUsersRoute(req, res) {
    const { userId } = req.params;

    db.query(
      "SELECT username, registration_date, profile_picture, full_name FROM Users WHERE user_id = ?",
      [userId],
      (err, results) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(results[0]);
      }
    );
  }

  /**
   * @brief Gets the data of a user
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */
  static getUserInfoRoute(req, res) {
    const { userId } = req.params;

    db.query(
      "SELECT * FROM Users WHERE user_id = ?",
      [userId],
      (err, results) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(results[0]);
      }
    );
  }

  /**
   * @brief Sends a message to a conversation
   * 
   * @param {Request} req The request object
   * @param {Response} res The response object
   * 
   * @returns {void}
   */   
  static sendMessageRoute(req, res) {
    const { conversationId } = req.params;
    const { senderId, receiverId, messageText } = req.body;

    if (!senderId || !receiverId || !messageText) {
      return res.status(400).json({ message: "Missing message data" });
    }

    db.query(
      "INSERT INTO Messages (conversation_id, sender_id, receiver_id, message_text) VALUES (?, ?, ?, ?)",
      [conversationId, senderId, receiverId, messageText],
      (err, results) => {
        if (err) {
          console.error("Error sending message:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        res.status(201).json({ message_id: results.insertId });
      }
    );
  }
}

module.exports = Api;