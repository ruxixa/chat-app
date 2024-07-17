/**
 * @file conversations.mjs
 * 
 * @brief This file contains the JavaScript modules
 * for the authorization management 
 * 
 * @license MIT
 * @author ruxixa
 * @copyright 2024
 */

/**
 * @brief Returns the authorization header for the logged-in user.
 * 
 * @returns {string} The authorization header.
 */
export function getAuthorizationHeader() {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  return `Basic ${btoa(`${username}:${password}`)}`;
}