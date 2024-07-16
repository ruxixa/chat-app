export function getAuthorizationHeader() {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  return `Basic ${btoa(`${username}:${password}`)}`;
}