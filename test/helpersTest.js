const chai = require('chai');
const assert = chai.assert;

//const { users } = require('../express_server');

const findUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    console.log(findUserByEmail);
    
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });
});

describe('findUserByEmail', function() {
  it('should return undefined if the user email is not in databasel', function() {
    const user = findUserByEmail("user33@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });
});