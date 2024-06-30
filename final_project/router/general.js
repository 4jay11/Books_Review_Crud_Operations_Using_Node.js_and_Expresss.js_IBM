const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const authenticate = require('./authenticate');
// ---------------------------------------------------------
// Define a synchronous function to get all books
const getBook = () => {
  return books; // Assuming 'books' is already defined
};

//1. Route to get all books
public_users.get('/', (req, res) => {
  try {
    const bookList = getBook();
    res.json(bookList);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//2. Route to get book details by ISBN
public_users.get('/nisbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = books[isbn];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//3. Route to get book details by author
public_users.get('/nauthor/:author', (req, res) => {
  const author = req.params.author;
  try {
    const bookList = getBook();
    const filteredBooks = Object.values(bookList).filter((book) => book.author === author);
    if (filteredBooks.length) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "Books not found for author" });
    }
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//4. Route to get book details by title
public_users.get('/ntitle/:title', (req, res) => {
  const title = req.params.title;
  try {
    const bookList = getBook();
    const filteredBooks = Object.values(bookList).filter((book) => book.title === title);
    if (filteredBooks.length) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "Books not found for title" });
    }
  } catch (error) {
    console.error(`Error fetching books with title ${title}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});


//5. Get book review
public_users.get('/review/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = books[isbn];
    if (book && book.reviews) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "Book or reviews not found" });
    }
  } catch (error) {
    console.error(`Error fetching reviews for book with ISBN ${isbn}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//6. Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

//7. Login
public_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const user = users.find((user) => user.username === username && user.password === password);
  if (user) {
    return res.status(200).json({ message: "User login successfully" });
  }
  return res.status(401).json({ message: "Invalid username or password" });
});


//8. Add or modify a review for a book
public_users.post('/add/review/:isbn', authenticate, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  const book = books[isbn];
  if (book) {
    if (!book.reviews) {
      book.reviews = {};
    }
    const isNewReview = !book.reviews[req.user.username];
    book.reviews[req.user.username] = review;

    if (isNewReview) {
      return res.status(201).json({ message: "Review added successfully" });
    } else {
      return res.status(200).json({ message: "Review modified successfully" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//9. Delete a review for a book
public_users.delete('/delete/review/:isbn', authenticate, (req, res) => {
  const isbn = req.params.isbn;

  const book = books[isbn];

  // Check if the book exists
  if (book) {
    // Check if reviews exist and if the user has a review for the book
    if (book.reviews && book.reviews[req.user.username]) {
      // Delete the user's review
      delete book.reviews[req.user.username];

      // If no other reviews exist, delete the reviews object
      if (Object.keys(book.reviews).length === 0) {
        delete book.reviews;
      }

      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// --------------------------------------------------------

const getBooks = () => {
  return new Promise((resolve) => {
    resolve(books);
  });
};

// 10. Get all books
public_users.get('/a/', async (req, res) => {
  try {
    const bookList = await getBooks();
    res.json(bookList);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//11. Get book details by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = books[isbn];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//12. Get book details by author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const bookList = await getBooks();
    const filteredBooks = Object.values(bookList).filter((book) => book.author === author);
    if (filteredBooks.length) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "Books not found for author" });
    }
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//13. Get book details by title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const bookList = await getBooks();
    const filteredBooks = Object.values(bookList).filter((book) => book.title === title);
    if (filteredBooks.length) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "Books not found for title" });
    }
  } catch (error) {
    console.error(`Error fetching books with title ${title}:`, error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// -----------------------------------------------------

module.exports.general = public_users;