import { getAuthorizationHeader } from "./authorization.mjs";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "") {
    document.getElementById("usernameError").textContent =
      "Username is required.";
    return;
  }

  if (password === "") {
    document.getElementById("passwordError").textContent =
      "Password is required.";
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("password", password);

  console.log("FETCHING...");
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        document.getElementById("usernameError").textContent =
          "Invalid login credentials.";
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

            localStorage.setItem("conversations", JSON.stringify(data.conversations));

            window.location.href = "/app";
          })
          .catch((error) => {
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
      } else {
        return response.json();
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
});
