/**
 * @file login.mjs
 * 
 * @brief This file contains the JavaScript modules
 * for the conversation management 
 * 
 * @license MIT
 * @author ruxixa
 * @copyright 2024
 */
import { getAuthorizationHeader } from "./authorization.mjs";

const loginForm = document.querySelector(".login-form");

// Add an event listener to the loginForm that logs in the user
// and redirects to the app page.
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.querySelector(".username-input").value;
  const password = document.querySelector(".password-input").value;

  if (username === "") {
    document.querySelector(".usermame-input").textContent = "Username is required.";
    return;
  }

  if (password === "") {
    document.querySelector(".password-input").textContent = "Password is required.";
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("password", password);

  login(username, password);
});

/**
 * @brief Logs in the user and redirects to the app page
 * 
 * @param {string} username The username of the user
 * @param {string} password The password of the user
 * 
 * @returns {void}
 */
function login(username, password) {
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  })
  .then((response) => {
    if (!response.ok) {
      document.querySelector(".username-error").textContent = "Invalid login credentials.";
      return;
    }
    if (response.status === 204) {
      fetch("/api/@me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthorizationHeader(),
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("userId", data.user.user_id);
        localStorage.setItem("fullName", data.user.full_name);
        localStorage.setItem("profilePicture", data.user.profile_picture);

        localStorage.setItem(
          "conversations",
          JSON.stringify(data.conversations)
        );

        window.location.href = "/app";
      })
    } else {
      return response.json();
    }
  })
}
