import { getAuthorizationHeader } from "./authorization.mjs";
import { loadConversation } from "./conversations.mjs";

const usersContainer = document.querySelector(".users-container");

function createConversation(user1Id, user2Id) {
  fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(),
    },
    body: JSON.stringify({ user1Id, user2Id }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const conversationId = data.conversation_id;
      loadConversation(conversationId);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function addUsers() {
  const loggedId = localStorage.getItem("userId");
  const loggedUsername = localStorage.getItem("username");
  const loggedConversations = JSON.parse(localStorage.getItem("conversations"));

  fetch("/api/users", {
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((user) => {
        const userId = user.user_id;

        if (user.username === loggedUsername) {
          return;
        }

        const userElement = document.createElement("div");
        userElement.className =
          "flex items-center p-4 bg-gray-800 rounded-lg mb-4 border-gray-700 border";
        userElement.style.cursor = "pointer";
        userElement.innerHTML = `
          <img src="${user.profile_picture}" alt="User Photo" class="w-12 h-12 rounded-full mr-4">
          <div>
            <h2 class="text-lg font-semibold">${user.full_name}</h2>
            <p class="text-sm text-gray-400">@${user.username}</p>
          </div>`;

        userElement.addEventListener("click", function () {
          const conversation = loggedConversations.find(
            ({ user1_id, user2_id }) =>
              (user1_id === userId && user2_id === loggedId) ||
              (user1_id === loggedId && user2_id === userId)
          );

          if (conversation) {
          } else {
            createConversation(loggedId, userId);
          }
        });

        usersContainer.appendChild(userElement);
      });
    });
}

addUsers();
