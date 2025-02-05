// Name: Scott Green
// Date: January 25, 2025
// File Name: app.js
// Description: In-N-Out-Books Application

// Require Statements
const express = require("express");
const createError = require("http-errors");
const books = require("../database/books");

// Create an Express application
const app = express();

app.use(express.json());                        // parse incoming requests as JSON
app.use(express.urlencoded({ extended: true})); // for parsing incoming payloads

app.get("/", async(req, res, next) => {
  //next(createError(500)); //test 500 error - see https://stackoverflow.com/questions/34227216/process-env-vs-app-getenv-on-getting-the-express-js-environment

  // HTML content for the landing page
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>In-N-Out-Books</title>
    <style>
      body, h1, h2, h3 {margin: 0; padding: 0; border: 0;}
      body {
        background: #000080;
        color: #fff;
        margin: 1.25rem;
        font-size: 1.25rem;
      }
      h1, h2, h3 { color: #CFB53B; font-family: 'Courier New', serif;}
      h1, h2 { text-align: center}
      h3 { color: #fff;}
      .container { width: 50%; margin: 0 auto; font-family: 'Lora', serif;}
      .about, .best_sellers, .store_info { border: 1px solid #CFB53B; padding: 1rem; margin: 1rem 0;}
      .about h3 { margin-top: 0;}

      main a { color: #FFF; text-decoration: underline;}
    </style>
  </head>

  <body>
    <div class="container">
      <header>
        <h1>In-N-Out-Books</h1>
        <h2>Discover and Share Amazing Books</h2>
      </header>

      <br />

      <main>
        <div class="about">
          <h3>About Us</h3>
          <p>
              The idea of In-N-Out Books was inspired by the love of books and the desire to create a platform where users can manage their own collection of books.
              Whether you are an avid reader who wants to keep track of the books you've read, or a book club organizer who needs to manage a shared collection, In-N-Out-Books
              is designed to cater to your needs.
          </p>
        </div>

        <div class="best_sellers">
          <h3>Best Sellers</h3>
          <ol>
            <li>The Hitchhiker's Guide to the Galaxy</li>
            <li>The Restaurant at the End of the Universe</li>
            <li>Life, the Universe and Everything</li>
            <li>So Long, and Thanks for All the Fish</li>
            <li>Young Zaphod Plays It Safe</li>
          </ol>
        </div>

        <div class="store_info">
          <div class="hours">
            <h3>Hours</h3>
            <ul>
              <li>M - F: 9:00am - 9:00pm</li>
              <li>Sat/Sun: 10:00am - 9:00pm</li>
            </ul>
          </div>

          <div class="contact_info">
            <h3>Contact Information</h3>
            <ul>
              <li>Phone: <a href="tel:+5555555555">555-555-5555</a></li>
              <li>Email: <a href="mailto:info@inandoutbooks.com">info@inandoutbooks.com</a></li>
            </ul>
          </div>

          <div class="location">
            <h3>Location</h3>
            <p>&emsp;123 Main St<br>&emsp;Tempe, AZ 85281</p>
          </div>
        </div>
      </main>
    </div>
  </body>
  </html>
  `;  // end HTML content for the landing page

  res.send(html); // Sends the HTML content to the client
});

app.get("/api/books", async(req, res, next) => {
  try{
    const allBooks = await books.find();
    console.log("All Books: ", allBooks); //Logs all books
    res.send(allBooks); // Sends response with all books
  } catch (err) {
    console.error("Error: ", err.message);  // Logs error message
    next(err);  // Passes error to the next middleware
  }
});

app.get("/api/books/:id", async(req, res, next) => {
  try {
    let {id} = req.params;
    id = parseInt(id);

    if(isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }

    const book = await books.findOne({id: Number(req.params.id)});

    console.log("Book: ", book);
    res.send(book);
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

app.post("/api/books", async (req, res, next) => {
  try {
    const newBook = req.body;

    //const expectedKeys = ["id", "title", "author"];
    const receivedKeys = Object.keys(newBook);

    // if(!receivedKeys.every(key=>expectedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
    //   console.error("Bad Request: Missing keys or extra keys", receivedKeys);
    //   return next(createError(400, "Bad Request"));
    // }

    if(!receivedKeys.includes("title")) {
      console.error("Bad Request: Missing title");
      return next(createError(400, "Bad Request"));
    }

    const result = await books.insertOne(newBook);
    console.log("Result: ", result);
    res.status(201).send({id:result.ops[0].id});
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

app.delete("/api/books/:id", async (req, res, next)=>{
  try{
    const {id} = req.params;
    const result = await books.deleteOne({id:parseInt(id)});
    console.log("Result: ", result);
    res.status(204).send();
  } catch (err) {
    if (err.message === "No matching item found") {
      return next(createError(404, "Book not found"));
    }

    console.error("Error: ", err.message);
    next(err);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next){
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next){
  res.status(err.status||500);

  res.json({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  });
});

module.exports = app;