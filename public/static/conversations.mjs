import { getAuthorizationHeader } from "./authorization.mjs";

const messageInput = document.querySelector(".message-input");
const messageSendButton = document.querySelector(".message-send-button");

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
        const isSender =
          Number(localStorage.getItem("userId")) === message.sender_id;

        const bgColor = isSender ? "green-600" : "blue-600";
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
  if (loggedInUserId == conversation.user1_id) {
    receiverId = conversation.user2_id;
  } else {
    receiverId = conversation.user1_id;
  }

  sendMessage(conversationId, senderId, receiverId, messageText);
});

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
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      messageInput.value = "";
      loadConversation(conversationId);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
