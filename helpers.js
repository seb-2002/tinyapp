const { urlDatabase, users } = require("./express_server");

const duplicateEmail = (email, db) => {
  for (let user in db) {
    if (db[user].email === email) return true;
  }
  return false;
};

const generateRandomString = () => Math.random().toString(36).substring(2, 8);

const emailLookup = (email, db) => {
  for (let user in db) {
    if (db[user].email === email) return user;
  }
};

const emailArray = (db) => {
  for (let user in db) {
    console.log(db[user].email);
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

//console.log(filterURLSByUserID("userRandomID", urlDatabase));

module.exports = {
  duplicateEmail,
  generateRandomString,
  emailArray,
  emailLookup,
  filterURLSByUserID,
};
