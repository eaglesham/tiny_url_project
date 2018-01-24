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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "mikeUserID": {
    id: "mikeUserID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "ikeUserID": {
    id: "ikeUserID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register")
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.url.slice(3)];
  res.redirect(longURL);
});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
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
  urlDatabase[random] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${random}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('http://localhost:8080/urls/');
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('http://localhost:8080/urls/');
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("http://localhost:8080/urls/");
})


app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});