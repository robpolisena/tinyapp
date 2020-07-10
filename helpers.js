const findUserByEmail = (email, database) => {
  // loop through the users in the db
  for (let userId in database) {
    // if email match the email from the user from the db, return the user
    if (database[userId].email === email) {
      // return the full user object
      return database[userId];
    }
  }
  return false;
};

module.exports = findUserByEmail;