const { hash } = require("./helpers");

// "DATABASES"
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: hash("pass"),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hash("dishwasher-funk"),
  },
};

module.exports = {
  urlDatabase,
  users,
};
