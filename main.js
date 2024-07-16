const bodyParser = require('body-parser');
const express = require('express');

const Api = require("./src/api/routes");
const Db = require("./src/db/db");
Db.connect();

const PORT = process.env.PORT || 3000;

const app = express();
const path = require('path');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.post("/login", Api.checkAuthMiddleware, Api.loginRoute)
app.post("/api/conversations", Api.checkAuthMiddleware, Api.createConversationRoute)
app.post("/api/conversations/:conversationId/messages", Api.checkAuthMiddleware, Api.sendMessageRoute)

app.get("/api/conversations/:conversationId/messages", Api.checkAuthMiddleware, Api.getMessagesRoute)
app.get("/api/@me", Api.checkAuthMiddleware, Api.getMeRoute)
app.get("/api/users/", Api.checkAuthMiddleware, Api.getUsersRoute)
app.get("/api/users/:userId", Api.checkAuthMiddleware, Api.getUserInfoRoute)

app.listen(PORT, () => {
  console.log(`Serwer Express działa na porcie ${PORT}`);
});
