// GLOBAL VARIABLES

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

// SETTINGS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"], // replace with more secure keys
  })
);
app.set("view engine", "ejs");

// HELPER FUNCTIONS

const {
  duplicateEmail,
  generateRandomString,
  emailLookup,
  filterURLSByUserID,
  alertFalsePassword,
  hash,
  assertURLBelongsToUser,
  assertKey,
} = require("./helpers");

// DATABASES

const { urlDatabase, users } = require("./dbs");

// LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ROUTES

// public

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// app.get("/u/:shortURL", (req, res) => {

//   const longURL = urlDatabase[req.params.shortURL].longURL;
//   if (longURL) {
//     res.redirect(longURL);
//   } else {
//     req.session["error"] =
//       "we couldn't find any website at that address. Login to create one!";
//     res.redirect("/login");
//   }
// });

app.get("/u/:shortURL", (req, res) => {
  req.session["error"] = null;
  const shortURL = req.params.shortURL;
  console.log(`Query assertion: ${assertKey(shortURL, urlDatabase)}`);
  if (assertKey(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else if (req.session["user_id"]) {
    req.session["error"] = "we couldn't find a matching URL.";
    res.redirect("/urls/new");
  } else {
    req.session["error"] =
      "we couldn't find any website at that address. Login to create one!";
    res.redirect("/login");
  }
});

// login and registration

// deal with login and register buttons on the login page
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    req.session["error"] = null;
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session["user_id"]],
    invalidPassword: req.session["invalidPassword"],
    noEmailMatch: req.session["noEmailMatch"],
    error: req.session["error"],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const id = emailLookup(email, users);
  console.log("id", id);
  if (!id) {
    res.status(403);
    req.session["noEmailMatch"] = true;
    req.session["invalidPassword"] = null;
    req.session["error"] = null;
    res.redirect("/login");
    // and then ....
  } else if (alertFalsePassword(password, users[id].password)) {
    res.status(403);
    req.session["error"] = null;
    req.session["noEmailMatch"] = null;
    req.session["invalidPassword"] = true;
    res.redirect("/login");
    // and then ....
  } else {
    req.session["error"] = null;
    req.session["noEmailMatch"] = null;
    req.session["invalidPassword"] = null;
    req.session["user_id"] = id;
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  console.log(req.session["user_id"]);
  if (req.session["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session["user_id"]],
    badLogin: req.session["missingUsernameOrPassword"],
    duplicateEmail: req.session["duplicateEmail"],
  };
  res.render("register", templateVars);
});

// bug : if I try to login to an already existing account it says 'duplicate email' but doesn't send me to the login page
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  if (duplicateEmail(email, users)) {
    res.status(400);
    req.session["duplicateEmail"] = true;
    req.session["missingUsernameOrPassword"] = null;
    res.redirect("/register");
  } else if (!password) {
    res.status(400);
    req.session["duplicateEmail"] = null;
    req.session["missingUsernameOrPassword"] = true;
    res.redirect("/register");
  } else {
    users[id] = {
      id,
      email,
      password: hash(password),
    };
    req.session["user_id"] = id;
    req.session["missingUsernameOrPassword"] = null;
    req.session["duplicateEmail"] = null;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  req.session["error"] = null;
  res.redirect("/login");
});

// url index

// add an if statement before the function to prevent error
app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    req.session["error"] = "login to access URLs!";
    res.redirect("/login");
  }
  const urls = filterURLSByUserID(user.id, urlDatabase);
  const templateVars = {
    user,
    urls,
    error: req.session["error"],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const newShortURL = generateRandomString();
    // pull the user object from cookies
    const user = users[req.session["user_id"]];
    // the longURL comes from the form on '/urls_new'
    const longURL = req.body.longURL;
    urlDatabase[newShortURL] = {
      longURL,
      userID: user.id,
    };
    req.session["error"] = null;
    const redirectPage = `/urls/${newShortURL}`;
    res.redirect(redirectPage);
  } else {
    req.session["error"] = "Login to edit URLs!";
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("Delete request!");
  // user is the user object logged in cookies
  const user = users[req.session["user_id"]];
  // thisURL is the shortURL present in the post request header
  const thisURL = req.params.shortURL;
  //only update the database if user.id === urlDatabase[thisURL].userID
  if (user && user.id === urlDatabase[thisURL].userID) {
    req.session["error"] = null;
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else if (!user) {
    req.session["error"] = "login to edit URLs!";
    res.redirect("/login");
  } else {
    req.session["error"] = "you can only edit your own URLS!";
    res.redirect("/login");
  }
});

// short URL pages

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
    error: req.session["error"],
  };
  if (templateVars.user) {
    req.session["error"] = null;
    res.render("urls_new", templateVars);
  } else {
    req.session["error"] = "login to generate a new shortURL!";
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const thisURL = req.params.shortURL;
  // if no-one is logged in, send the user to the login page
  if (!req.session["user_id"]) {
    req.session["error"] = "login to access URLs!";
    res.redirect("/login");
    // if the user is logged in but there's no urlDatabase entry for that :shortURL
  } else if (!urlDatabase[thisURL]) {
    req.session["error"] = "that shortURL doesn't exist yet!";
    res.redirect("/urls/new");
    // if that url DOES exist but does not belong to the user to modify
  } else if (
    !assertURLBelongsToUser(thisURL, req.session["user_id"], urlDatabase)
  ) {
    req.session["error"] = "You don't have permission to modify that shortURL!";
    res.redirect("/urls");
  } else {
    req.session["error"] = null;
    const templateVars = {
      user: users[req.session["user_id"]],
      shortURL: thisURL,
      longURL: urlDatabase[thisURL].longURL,
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  // user is the user object logged in cookies
  const user = users[req.session["user_id"]];
  // thisURL is the shortURL present in the post request header
  const thisURL = req.params.id;
  //only update the database if user.id === urlDatabase[thisURL].userID
  if (user && user.id === urlDatabase[thisURL].userID) {
    // this request body comes from 'urls_show'
    urlDatabase[thisURL].longURL = req.body.newURL;
    res.redirect("/urls");
  } else if (!user) {
    req.session["error"] = "login to edit URLs!";
    res.redirect("/login");
  } else {
    req.session["error"] = "you can only edit your own URLS!";
    res.redirect("/login");
  }
});

// dev exports
module.exports = {
  urlDatabase,
  users,
};
