/**
 * @file conversations.mjs
 * 
 * @brief This file contains the JavaScript modules
 * for the conversations management
 * 
 * @license MIT
 * @author ruxixa
 * @copyright 2024
 */
import { getAuthorizationHeader } from "./authorization.mjs";

const messageInput = document.querySelector(".message-input");
const messageSendButton = document.querySelector(".message-send-button");

// Add an event listener to the messageSendButton 
// that sends a message to the conversation.
messageSendButton.addEventListener("click", () => {
  const conversationId = localStorage.getItem("conversationId");
  const loggedInUserId = localStorage.getItem("userId");
  const messageText = messageInput.value;

  const conversations = JSON.parse(localStorage.getItem("conversations"));
  const conversation = conversations.find(
    (conv) => conv.conversation_id == conversationId
  );

  let senderId, receiverId;
  senderId = loggedInUserId;

  // If the logged-in user is user1, the receiver is user2.
  // If the logged-in user is user2, the receiver is user1.
  if (loggedInUserId == conversation.user1_id) {
    receiverId = conversation.user2_id;
  } else {
    receiverId = conversation.user1_id;
  }

  sendMessage(conversationId, receiverId, senderId, messageText);
});

/**
 * @brief Sends a message to the conversation
 * 
 * @param {string} conversationId The ID of the conversation
 * @param {string} receiverId The ID of the receiver
 * @param {string} senderId The ID of the sender
 * @param {string} messageText The text of the message
 * 
 * @returns {void}
 */
function sendMessage(conversationId, receiverId, senderId, messageText) {
  fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(),
    },
    body: JSON.stringify({
      senderId: senderId,
      receiverId: receiverId,
      messageText: messageText,
    }),
  })
  .then((response) => {
    if (!response.ok) {
      console.log(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    messageInput.value = ""; // Clear the message input.
    loadConversation(conversationId); // Reload the conversation.
  })
}

/**
 * @brief Loads the conversation with the given ID
 * 
 * @param {string} conversationId The ID of the conversation
 * 
 * @returns {void}
 */
export function loadConversation(conversationId) {
  const messagesContainer = document.querySelector(".messages-container");
  messagesContainer.innerHTML = "";

  localStorage.setItem("conversationId", conversationId);

  fetch(`/api/conversations/${conversationId}/messages`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(),
    },
  })
  .then((response) => response.json())
  .then((data) => {
    data.forEach((message) => {
      const isSender = Number(localStorage.getItem("userId")) === message.sender_id;

      const bgColor = isSender ? "blue-600" : "green-600";
      const align = isSender ? "end" : "start";

      messagesContainer.insertAdjacentHTML(
        "beforeend",
        `<div class="bg-${bgColor} text-white rounded-lg px-4 py-2 max-w-xs self-${align} mb-2 mr-2">
            <p class="text-gray-200">${message.message_text}</p>
          </div>`
      );
    });
  });
}

/**
 * @brief Creates a new conversation between two users
 * 
 * @param {string} user1Id The ID of the first user
 * @param {string} user2Id The ID of the second user
 * 
 * @returns {void}
 */
export function createConversation(user1Id, user2Id) {
  const endpoint = "/api/conversations";

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(),
    },
    body: JSON.stringify({ user1Id, user2Id }),
  })
  .then((response) => {
    if (!response.ok) {
      console.log(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const conversationId = data.conversation_id;
    loadConversation(conversationId);
  })
}
