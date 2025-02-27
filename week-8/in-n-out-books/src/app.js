// Name: Scott Green
// Date: February 26, 2025
// File Name: app.js
// Description: In-N-Out-Books Application

// Require Statements
const express = require("express");
const createError = require("http-errors");
const books = require("../database/books");
const users = require("../database/users");
const bcrypt = require("bcryptjs");
const Ajv = require("ajv");

// Create an Express application
const app = express();

// Create an ajv instance
const ajv = new Ajv();

// ajv schema
const securityQuestionsSchema = {
  type: "object",
  properties:{
    securityQuestions:{
      type:"array",
      items:{
        type:"object",
        properties:{
          answer:{type:"string"}
        },
        required:["answer"],
        additionalProperties:false
      }
    }
  },
  required:["securityQuestions"],
  additionalProperties:false
};

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

// retrieve all books
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

// retrieve a specific book
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

// create a book
app.post("/api/books", async (req, res, next) => {
  try {
    const newBook = req.body;
    const receivedKeys = Object.keys(newBook);

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

// login a user
app.post("/api/login", async (req, res, next) => {
  try {
    const user = req.body;  // get user's information

    const expectedKeys = ["email", "password"]; //list of expected keys passed in request body
    const receivedKeys = Object.keys(user); //actual keys passed in request body

    // Check if there's too many or too few keys
    if(!receivedKeys.every(key => expectedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys); // logout the error
      return next(createError(400, "Bad Request")); // return 400 on error
    }

    // see if the email trying to log in already exists so we can check it's password against the provided one
    const requestedUser = await users.findOne({
      email: user.email
    })

    // compare provided password against known hash of password
    if (!bcrypt.compareSync(user.password, requestedUser.password)) {
      console.error("Unauthorized");  // if they don't match, throw a 401 error
      return next(createError(401, "Unauthorized"))
    }

    res.status(200).send({message: "Authentication successful"}); // otherwise return success
  } catch (err) { // catch errors and deal with them
    console.error("Error: ", err.message);
    next(err);
  }
});

// verify a user's security questions
app.post("/api/users/:email/verify-security-question", async (req, res, next) => {
  try {
    const { securityQuestions } = req.body; // get the security questions from the request body
    const { email } = req.params; // get the email from the parameters

    const validate = ajv.compile(securityQuestionsSchema);  // compile the ajv schema
    const valid = validate(req.body); // check if the request body is valid against the ajv schema

    if (!valid) { // if the request body is not valid per the ajv schema, throw an error
      console.error("Bad Request: Invalid request body");
      return next(createError(400, "Bad Request"));
    }

    const user = await users.findOne({ email: email }); // find the user by their email

    if(securityQuestions[0].answer !== user.securityQuestions[0].answer ||  // check that the security answers they provide match what is in the database
       securityQuestions[1].answer !== user.securityQuestions[1].answer ||
       securityQuestions[2].answer !== user.securityQuestions[2].answer) {

        console.error("Unauthorized: Security questions do not match");
        return next(createError(401, "Unauthorized"));  // throw an error if the answers do not match
    }

    res.status(200).send({ message: "Security questions successfully answered", user: user}); // otherwise, return success
  } catch (err) { // handle any errors
    console.error("Error: ", err.message);
    next(err);
  }
})

// delete a book
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

// update a book
app.put("/api/books/:id", async(req, res, next) => {
  try {
    let { id } = req.params;  // get the id
    let book = req.body;      // get the request body
    id = parseInt(id);        // parse the id as an integer

    // throw an error if the id is not a number
    if (isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }

    const expectedKeys = ["id", "title", "author"]; // list of expected keys
    const receivedKeys = Object.keys(book);         // list of keys received

    // throw an error if we did not receive the expected keys or got extra keys
    if(!receivedKeys.every(key => expectedKeys.includes(key)) || receivedKeys.length != expectedKeys.length) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }

    // Perform the book update, log the result to the console, and return a 204 success message
    const result = await books.updateOne({id: id}, book);
    console.log("Result: ", result);
    res.status(204).send();
  } catch (err) {
    if (err.message === "No matching item found") {     // An error was trapped
      console.error("Book not found", err.message)      // log the error to console
      return next(createError(404, "Book not found"));  // return 404 error message
    }

    console.error("Error: ", err.message);              // log any other errors to the console
    next(err);                                          // pass the error to the next error handler
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