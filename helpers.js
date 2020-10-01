const bcrypt = require("bcrypt");

const duplicateEmail = (email, db) => {
  for (let user in db) {
    if (db[user].email === email) return true;
  }
  return false;
};

const assertKey = (url, db) => {
  for (let key in db) {
    if (url === key) return true;
  }
  return false;
};

const generateRandomString = () => Math.random().toString(36).substring(2, 8);

const emailLookup = (email, db) => {
  for (let user in db) {
    if (db[user].email === email) return user;
  }
};

const filterURLSByUserID = (userID, db) => {
  filteredDatabase = {};
  for (let shortURL in db) {
    if (db[shortURL].userID === userID) {
      filteredDatabase[shortURL] = db[shortURL];
    }
  }
  return filteredDatabase;
};

const assertURLBelongsToUser = (url, userID, db) => {
  const filteredDatabase = filterURLSByUserID(userID, db);
  console.log(JSON.stringify(filteredDatabase));
  for (let key in filteredDatabase) {
    console.log(key);
    console.log(url);
    if (key === url) {
      return true;
    }
  }
  return false;
};

const hash = (password) => bcrypt.hashSync(password, 10);

const alertFalsePassword = (password, hashedPassword) => {
  if (bcrypt.compareSync(password, hashedPassword)) {
    return false;
  }
  return true;
};

module.exports = {
  duplicateEmail,
  generateRandomString,
  emailLookup,
  filterURLSByUserID,
  hash,
  alertFalsePassword,
  assertURLBelongsToUser,
  assertKey,
};
