const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3']
}));

app.set("view engine", "ejs");

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const personalURLs = {};
//generates collection of URLs from database that are assigned to that user id
function urlsForUser(id) {
  personalURLs[id] = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      personalURLs[id][key] = urlDatabase[key];
    }
  }
};


var urlDatabase = {
  "b2xVn2": {
    userID: 'mikeUserID', 
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: 'mikeUserID',
    longURL: "http://www.google.com"
  }
};

const users = {
  "mikeUserID": {
    id: "mikeUserID",
    email: "user@example.com",
    password: bcrypt.hashSync("a", 10)
  },
 "ikeUserID": {
    id: "ikeUserID",
    email: "user2@example.com",
    password: bcrypt.hashSync("b", 10)
  }
};

app.get("/", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect('http://localhost:8080/urls/');
  } else {
    res.redirect('http://localhost:8080/login/');
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { userObject: users[req.session["user_id"]] }
  if (req.session["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('http://localhost:8080/login/');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  urlsForUser(req.session["user_id"]);
  let templateVars = { urls: personalURLs[req.session["user_id"]], userObject: users[req.session["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  let templateVars = { userObject: users[req.session["user_id"]] }
  res.render("urls_login", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { userObject: users[req.session["user_id"]], shortURL: req.params.id, urls: urlDatabase, userObject: users[req.session["user_id"]] };
  //sends "URL does not exist" error page if short URL edit page is not of a short URL owned by the logged in user
  //sends "please login" error page if not logged in
  if (req.session["user_id"] && (req.session["user_id"] !== urlDatabase[req.params.id].userID)) {
    res.send("This short URL does not exist.")
  } else if (req.session["user_id"]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Please login or register");
  }
});

//page that redirects short URL to full URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
  //sends error message if email or password field is submitted empty
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Error. Dint enter an email AND password, dumbass!');
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).send('Error. Yo that emails been taken!');
    };
  }
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session["user_id"] = userID;
  res.redirect('http://localhost:8080/urls/');
})

//creates new URL in database with random number as key
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {userID: req.session["user_id"], longURL: req.body.longURL};
  res.redirect(`http://localhost:8080/urls/${random}`);
});

//updates long URL paramter within user's selection of URLs. Accessed from Update button 
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('http://localhost:8080/urls/')
});

//accessed from delete button. Deletes given URL from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('http://localhost:8080/urls/');
})

app.post("/login", (req, res) => {
  let flag = true;
  //verifies that username and password match records in user database. If not sends error page.
  for (let userObject in users) {
    if(req.body.email === users[userObject].email && bcrypt.compareSync(req.body.password, users[userObject].password)) {
      flag = false;
      req.session["user_id"] = users[userObject].id;
      return res.redirect('http://localhost:8080/');
    };
  };
  if (flag) {
    return res.status(403).send('incorrect username or password');
  }
});
//all cookies cleared on logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("http://localhost:8080/login/");
})


app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});