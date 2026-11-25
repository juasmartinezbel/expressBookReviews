const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


const MESSAGE = {
  BOOK_NOT_FOUND: "Book not found",
  AUTHOR_NOT_FOUND: "Author not found",
  TITLE_NOT_FOUND: "Title not found",
  REQUIRED: "Unable to register user. Username and password are required.",
  EXISTING: "User already exists",
  REGISTER_SUCCESS: "Customer successfully registered. Now you can login"
}

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if(!username || !password) {
    const message = MESSAGE.REQUIRED;
    return res.status(400).json({message})
  }

  if(isValid(username)){
    const message = MESSAGE.EXISTING;
    return res.status(409).json({message});
  }

  users.push({username, password});
  const message = MESSAGE.REGISTER_SUCCESS; 
  return res.status(200).json({message});
});

// Get the book list available in the shop
public_users.get('/',function (_req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;

  if(books[isbn]) {
    return res.status(200).json(books[isbn]); 
  }
  const message = MESSAGE.BOOK_NOT_FOUND;
  return res.status(404).json({message}); 
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const filtered_books = [];
  const { author } = req.params;

  const bookKeys = Object.keys(books);

  bookKeys.forEach((key) => {
    const book = books[key] 
    const bookAuthor = book.author
    if(bookAuthor.toLowerCase() === author.toLowerCase()){
      const {title, reviews} = book;
      filtered_books.push({
        isb: key,
        author: bookAuthor,
        title,
        reviews
      })
    }
  });

  if(filtered_books.length > 0){
      return res.status(200).json(filtered_books)
  }
  const message = MESSAGE.AUTHOR_NOT_FOUND;
  return res.status(404).json({message});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const filtered_books = [];

  const { title } = req.params;

  const bookKeys = Object.keys(books);

  bookKeys.forEach((key) => {
    const book = books[key] 
    const bookTitle = book.title
    if(bookTitle.toLowerCase() === title.toLowerCase()){
      const {author, reviews} = book;
      filtered_books.push({
        isb: key,
        author,
        title: bookTitle,
        reviews
      })
    }
  });
  if(filtered_books.length > 0){
      return res.status(200).json(filtered_books)
  }
  const message = MESSAGE.TITLE_NOT_FOUND;
  return res.status(404).json({message});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;

  if(books[isbn])
    return res.status(200).json(books[isbn].reviews);

  const message = MESSAGE.BOOK_NOT_FOUND;
  return res.status(404).json({message});
});


const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/isbn/${isbn}`)
      .then(response => {
        console.log(response.data);
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${author}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

module.exports.general = public_users;
