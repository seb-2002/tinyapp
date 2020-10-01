// GLOBAL VARIABLES

const assert = require("chai").assert;
const {
  duplicateEmail,
  emailLookup,
  filterURLSByUserID,
  hash,
  alertFalsePassword,
} = require("../helpers");

// EXAMPLE DATABASES

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: hash("purple-monkey-dinosaur"),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hash("dishwasher-funk"),
  },
};

// MOCHA TESTS

describe("#duplicateEmail", () => {
  it("should return true if the email passed to the function exist already in the db", () => {
    assert.isTrue(duplicateEmail("user@example.com", users));
  });
  it("should return false if the email passed to the function does not exist already in the db", () => {
    assert.isFalse(duplicateEmail("coco@coco.net", users));
  });
});

describe("#emailLookup", () => {
  it("returns the corresponding userID when passed an email and a db", () => {
    assert.strictEqual(emailLookup("user@example.com", "userRandomID"));
  });
  it("returns undefined when passed an email that doesn't exist in the db", () => {
    assert.isNotOk(emailLookup("coco@coco.net", users));
  });
});

describe("#filterURLSByUserID", () => {
  it("returns an object containing all the objects of the database for a corresponding user id ", () => {
    const user2sURLS = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
    };
    assert.deepEqual(
      filterURLSByUserID("user2RandomID", urlDatabase),
      user2sURLS
    );
  });
  it("returns an empty object when there are no entries for that user in the db", () => {
    const emptyObject = {};
    assert.deepEqual(
      filterURLSByUserID("madameCoco", urlDatabase),
      emptyObject
    );
  });
});

describe("#alertFalsePassword", () => {
  it("returns true if the password provided does not match the hashed password", () => {
    assert.isTrue(
      alertFalsePassword("cocoKrispies", hash("purple-monkey-dinosaur"))
    );
  });
  it("returns true if two identical arguments are passed", () => {
    assert.isTrue(alertFalsePassword("cocoKrispies", "cocoKrispies"));
  });
  it("returns true if passed two identical hashed passwords", () => {
    assert.isTrue(
      alertFalsePassword(
        hash("purple-monkey-dinosaur"),
        hash("purple-monkey-dinosaur")
      )
    );
  });
  it("returns false if passed a password and a corresponding hashed password", () => {
    assert.isFalse(
      alertFalsePassword(
        "purple-monkey-dinosaur",
        hash("purple-monkey-dinosaur")
      )
    );
  });
});
