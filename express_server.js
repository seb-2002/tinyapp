// GLOBAL VARIABLES

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// SETTINGS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// HELPER FUNCTIONS

const {
  duplicateEmail,
  generateRandomString,
  emailArray,
  emailLookup,
} = require("./helpers");

// "DATABASES"
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  //console.log(req.cookies);
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  const redirectPage = `/urls/${newShortURL}`;
  res.redirect(redirectPage);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies["user_id"]] });
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    invalidPassword: req.cookies["invalidPassword"],
    noEmailMatch: req.cookies["noEmailMatch"],
  };
  res.render("login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    badLogin: req.cookies["missingUsernameOrPassword"],
    duplicateEmail: req.cookies["duplicateEmail"],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  if (duplicateEmail(email, users)) {
    res.status(400);
    res.cookie("duplicateEmail", true);
    res.clearCookie("missingUsernameOrPassword");
    res.redirect("/register");
  } else if (!password) {
    res.status(400);
    res.clearCookie("duplicateEmail");
    res.cookie("missingUsernameOrPassword", true);
    res.redirect("/register");
  } else {
    users[id] = {
      id,
      email,
      password,
    };
    res.cookie("user_id", id);
    res.clearCookie("missingUsernameOrPassword");
    res.clearCookie("duplicateEmail");
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("Delete request!");
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  console.log("Database updated!");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const id = emailLookup(email, users);
  if (!id) {
    res.status(403);
    res.cookie("noEmailMatch", true);
    res.clearCookie("invalidPassword");
    console.log(res.statusCode);
    res.redirect("/login");
    // and then ....
  } else if (users[id].password !== password) {
    res.status(403);
    res.clearCookie("noEmailMatch");
    res.cookie("invalidPassword", true);
    console.log(res.statusCode);
    res.redirect("/login");
    // and then ....
  } else {
    res.clearCookie("noEmailMatch");
    res.clearCookie("invalidPassword");
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("404 - page not found");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
