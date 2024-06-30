const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const router = express.Router();
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  //returns boolean
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
}

const authenticatedUser = (username,password)=>{ 
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

//  Task 7
//  Only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({data:password}, "access", {expiresIn: 3600});
    req.session.authorization = {accessToken,username};
    return res.status(200).send("User successfully logged in");
  }
  else {
    return res.status(208).json({message: "Invalid username or password"});
  }
});


//The  code for authenticate the registered users only can add or modify a review for a book 
//And delete a review for a book is writen in a seperate file name authenticate.js
//The code is written in general.js file

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;