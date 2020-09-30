const duplicateEmail = (email, db) => {
  for (let user in db) {
    if (db[user].email === email) return true;
  }
  return false;
};

const generateRandomString = () => Math.random().toString(36).substring(2, 8);

const emailArray = (db) => {
  for (let user in db) {
    console.log(db[user].email);
  }
};
module.exports = { duplicateEmail, generateRandomString, emailArray };
