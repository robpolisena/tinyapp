const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const findUserByEmail = require('./helpers');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs'
const cookieSession = require('cookie-session');
const saltRounds = 10;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//app.use(cookieParser());
app.set("view engine", "ejs");

let shortURL = "";

const generateRandomString = () => {
  shortURL = Math.random().toString(36).substring(7);
  return shortURL;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3Bo4r: { longURL: "https://www.cp24.ca", userID: "b438nh" },
  i3co4r: { longURL: "https://www.cnn.com", userID: "b445nh" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds),
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userURLs = urlsForUserId(req.session['user_id']);
  const templateVars = { urls: userURLs, user: users[req.session['user_id']]};
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (users[req.session['user_id']]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session['user_id']]};
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session['user_id']]};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session['user_id']]};
  res.render("urls_register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session['user_id']]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session['user_id']]};
    res.render("urls_show", templateVars);
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: null};
    res.render("urls_show", templateVars);
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "") {
    res.status(400).send('Error: Please enter a valid email, please click your back button to continue');
  }
  if (req.body.password === "") {
    res.status(400).send('Error: Please enter a password, please click your back button to continue');
  }
  if (findUserByEmail(req.body.email)) {
    res.status(400).send('Error: This email already exists!');
  }
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password:  bcrypt.hashSync(req.body.password, saltRounds),
  };
  console.log(bcrypt.compareSync(req.body.password, users[userId].password));
  req.session['user_id'] = userId;
  res.redirect("/urls");
});

app.post("/urls/", (req, res) => {
  if (users[req.session['user_id']]) {
    generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session['user_id']};
    res.redirect("/urls/" + shortURL);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session['user_id']]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  if (users[req.session['user_id']]) {
    const longURL = req.body.longURL;
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = longURL;
    let templateVars = { urls: urlDatabase[shortURL].longURL = longURL, user: users[req.session['user_id']]};
    res.redirect("/urls"), templateVars;
  } else {
    res.redirect("/login");
  }
});

// returns urls associated to the user
const urlsForUserId = (userID) => {
  let URLs = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      URLs[id] = urlDatabase[id].longURL;
    }
  }  return URLs;
};
// valid if a user with this email exists
const authenticateUser = (email, password) => {
  const user = findUserByEmail(email, users);
  // check the email match
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

// Login the user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Authentication the user
  const user = authenticateUser(email, password);
  if (user) {
    // set the user id in the cookie
    //res.cookie('user_id', user['id']);
    req.session['user_id'] = user.id;
    // res.redirect /urls
    res.redirect("/urls");
  } else {
    res.status(403).send('Error: You have entered invalid credentials');
    res.redirect("/register");
  }
});

//logout the user
app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session['user_id'] = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});