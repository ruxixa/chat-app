/**
 * @file main.js
 * 
 * @brief This file is an entry point for the application
 * 
 * @license MIT
 * @author ruxixa
 * @copyright 2024
 */
const bodyParser = require('body-parser');
const express = require('express');

const Api = require("./src/api/routes");
const Db = require("./src/db/db");

const PORT = process.env.PORT || 3000;

const app = express();
const path = require('path');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * @brief Sets the routes for the application
 * 
 * @returns {void}
 */
function setRoutes() {
  app.post("/login", Api.checkAuthMiddleware, Api.loginRoute)
  app.post("/api/conversations", Api.checkAuthMiddleware, Api.createConversationRoute)
  app.post("/api/conversations/:conversationId/messages", Api.checkAuthMiddleware, Api.sendMessageRoute)
  
  app.get("/api/conversations/:conversationId/messages", Api.checkAuthMiddleware, Api.getMessagesRoute)
  app.get("/api/@me", Api.checkAuthMiddleware, Api.getMeRoute)
  app.get("/api/users/", Api.checkAuthMiddleware, Api.getUsersRoute)
  app.get("/api/users/:userId", Api.checkAuthMiddleware, Api.getUserInfoRoute)

  app.get("/app", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
  });
}

/**
 * @brief Initializes the application
 * 
 * @returns {void}
 */
function initialize() {
  Db.connect();
  setRoutes();

  app.listen(PORT, () => {
    console.log(`Serwer Express działa na porcie ${PORT}`);
  });
}

initialize();