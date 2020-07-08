const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());
app.set("view engine", "ejs");

let shortURL = "";

const generateRandomString = () => {
  shortURL = Math.random().toString(36).substring(7);
  return shortURL;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars;
  if (req.cookies) {
    console.log(`cookie: ${req.cookies['user_id']}`);
    templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  } else {
    templateVars = { urls: urlDatabase};
  }
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "") {
    res.status(400).send('Error: Please enter a valid email, please click your back button to continue');
  }
  if (req.body.password === "") {
    res.status(400).send('Error: Please enter a password, please click your back button to continue');
  }
  if (authenticateUser(req.body.email)) {
    res.status(400).send('Error: This email already exists!');
  }
  console.log(req.body);
  console.log(req.params);
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  };
  console.log(shortURL);
  console.log(`users: ${JSON.stringify(users)}`);
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
  console.log(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  let templateVars = { user: users[req.cookies['user_Id']]};
  res.redirect("/urls"), templateVars;
});

const findUserByEmail = (email) => {
  // loop through the users in the db
  for (let userId in users) {
    // if email match the email from the user from the db, return the user
    if (users[userId].email === email) {
      // return the full user object
      return users[userId];
    }
  }
  return false;
};

const authenticateUser = (email) => {
  // Does the user with that email exist?
  const user = findUserByEmail(email);

  // check the email match
  if (user.email === email) {
    return user;
  } else {
    return false;
  }
};

// Login the user
app.post("/login", (req, res) => {
  console.log(req.body);
  //const username = req.body.username;
  const email = req.body.email;

  // Authentication the user
  const user = authenticateUser(email);
  if (user) {
    // set the user id in the cookie
    res.cookie('user_id', user['id']);
    // res.redirect /urls
    res.redirect("/urls");
  } else {
  //res.status(401).send('Wrong credentials');
    res.redirect("/register");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});