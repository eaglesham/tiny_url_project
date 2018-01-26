var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
    password: "a"
  },
 "ikeUserID": {
    id: "ikeUserID",
    email: "user2@example.com",
    password: "b"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
//set up condition to go to urls page(?) if logged in. else go to login. set up findUsername function first!!

});

app.get("/urls/new", (req, res) => {
  let templateVars = { userObject: users[req.cookies["user_id"]] }
  if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('http://localhost:8080/login/');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  urlsForUser(req.cookies["user_id"]);
  let templateVars = { urls: personalURLs[req.cookies["user_id"]], userObject: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  let templateVars = { userObject: users[req.cookies["user_id"]] }
  res.render("urls_login", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { userObject: users[req.cookies["user_id"]], shortURL: req.params.id, urls: urlDatabase, userObject: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect('http://localhost:8080/login/')
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
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
    password: req.body.password
  };
  res.cookie("user_id", userID);
  res.redirect('http://localhost:8080/urls/');
})

app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {userID: req.cookies["user_id"], longURL: req.body.longURL};
  res.redirect(`http://localhost:8080/urls/${random}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('http://localhost:8080/urls/')
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('http://localhost:8080/urls/');
})

app.post("/login", (req, res) => {
  let flag = true;
  for (let userObject in users) {
    if(req.body.email === users[userObject].email && req.body.password === users[userObject].password) {
      flag = false;
      res.cookie("user_id", users[userObject].id);
      return res.redirect('http://localhost:8080/');
    };
  };
  if (flag) {
    return res.status(403).send('incorrect username or password');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("http://localhost:8080/login/");
})


app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});