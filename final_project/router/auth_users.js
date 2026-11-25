const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const MESSAGE = {
  LOGIN_ERROR: "Login error: Both fields are required",
  LOGIN_SUCCESS: "Customer successfully logged in",
  LOGIN_INVALID: "Invalid Login, check username and password",
  NO_REVIEW: "Review cannot be empty",
  BOOK_NOT_FOUND: "Book not found",
}

let users = [];

const isValid = (username)=> {
  const filteredUsers = users.filter((user) => user.username === username);
  return filteredUsers.length > 0;
}

const authenticatedUser = (username, password)=>{ 
  const validUsers = users.filter((user) => {
    return (user.username === username && user.password == password)
  });

  return validUsers.length > 0; 
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if(!username || !password) {
    const message = MESSAGE.LOGIN_ERROR;
    return res.status(401).json({message});
  }

  if(authenticatedUser(username, password)){
    const accessToken = jwt.sign({
      username
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    const message = MESSAGE.LOGIN_SUCCESS;
    return res.status(200).json({message});
  }
  const message = MESSAGE.LOGIN_INVALID;
  return res.status(401).json({message})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const { username } = req.session.authorization;

  if(!review) {
    const message = MESSAGE.NO_REVIEW;
    return res.status(400).json({message});
  };

  const book = books[isbn]
  if(book) {
    book.reviews[username] = review;
    return res.status(200).json({ 
      message: `The review for '${book.title}' by ${username} has been published successfully.`,
      reviews: book.reviews 
    });
  }
  const message = MESSAGE.BOOK_NOT_FOUND
  return res.status(404).json({message});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.session.authorization;

  const book = books[isbn];

  if (book) {
      
    if (book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ 
          message: `Review for '${book.title}' by ${username} deleted successfully.`
      });
    } else {
      return res.status(404).json({ message: `Review by ${username} not found for '${book.title}'.`});
    }
  }

  const message = MESSAGE.BOOK_NOT_FOUND
  return res.status(404).json({message});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
