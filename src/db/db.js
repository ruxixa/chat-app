/**
 * @file db.js
 * 
 * @brief This file contains the JavaScript modules
 * for the database management
 * 
 * @license MIT
 * @author ruxixa
 * @copyright 2024
 */
const mysql = require("mysql2");
const appConfig = require("../../appConfig.json");

/**
 * @class Database
 * @classdesc Class containing the database management
 */
class Database {
  // Database connection; initialized as null
  static connection = null;

  /**
   * @brief Connects to the database
   * 
   * @returns {void}
   */
  static connect() {
    Database.connection = mysql.createConnection({
      host: appConfig.db.host,
      user: appConfig.db.user,
      password: appConfig.db.password,
      database: appConfig.db.database,
    });

    Database.connection.connect((err) => {
      if (err) {
        console.error("DB connection error: " + err.stack);
        return;
      }
      console.log("Connected to MySQL. ID: " + Database.connection.threadId);
    });
  }
  
  /**
   * @brief Executes a query
   * 
   * @param {string} sql The SQL query
   * @param {Array} params The query parameters
   * @param {Function} callback The callback function
   * 
   * @returns {void}
   */
  static query(sql, params, callback) {
    if (!Database.connection) {
      console.error("No database connection.");
      return;
    }

    Database.connection.query(sql, params, (err, results, fields) => {
      if (err) {
        console.error("Query error: " + err.stack);
        if (callback) callback(err, null);
        return;
      }
      if (callback) callback(null, results);
    });
  }

  /**
   * @brief Ends the database connection
   * 
   * @note This function is not used in the current version 
   * of the application
   * 
   * @returns {void}
   */
  static end() {
    if (!Database.connection) {
      console.error("No database connection.");
      return;
    }

    Database.connection.end((err) => {
      if (err) {
        console.error("Failed to close database connection: " + err.stack);
        return;
      }
      console.log("Closed database connection.");
    });
  }
}

module.exports = Database;
