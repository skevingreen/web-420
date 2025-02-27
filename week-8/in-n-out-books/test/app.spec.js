const app=require("../src/app");
const request=require("supertest");

describe("Chapter 3: API Tests", () => {
  it("it should return an array of books", async () => {
    const res = await request(app).get("/api/books");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

    res.body.forEach((recipe) => {
      expect(recipe).toHaveProperty("id");
      expect(recipe).toHaveProperty("title");
      expect(recipe).toHaveProperty("author");
    });
  });

  it("should return a single book", async() => {
    const res = await request(app).get("/api/books/1");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("title", "The Fellowship of the Ring");
    expect(res.body).toHaveProperty("author", "J.R.R. Tolkien");
  });

  it("should return a 400 error if the id is not a number", async () => {
    const res = await request(app).get("/api/books/foo");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });
});

describe("Chapter 4: API Tests", () => {
  it("should return a 201 status code when adding a new book", async () => {
    const res = await request(app).post("/api/books").send({
      id: 6,
      title: "It",
      author: "Stephen King"
    });

    expect(res.statusCode).toEqual(201);
  });

  it("should return a 400 status code when adding a new book with missing title", async ()=>{
    const res = await request(app).post("/api/books").send({
      id: 7,
      author: "Stephen King"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return a 204 status code when deleting a book", async()=>{
    const res = await request(app).delete("/api/books/6");

    expect(res.statusCode).toEqual(204);
  });
})

describe("Chapter 5: API Tests", () => {
  it("should return a 204 status code when updating a book", async() => {
    const res = await request(app).put("/api/books/1").send({
      id: 1,
      title: "The Shining",
      author: "Stephen King"
    })

    expect(res.statusCode).toEqual(204);
  });


  it("should return 400 status code when updating a book with a non-numeric id", async () => {
    const res = await request(app).put("/api/books/foo").send({
      id: 7,
      title: "'Salem's Lot",
      author: "Stephen King"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });


  it("should return a 400 status code when updating a book with missing title", async () => {
    const res = await request(app).put("/api/books/8").send({
      id: 8,
      author: "Stephen King"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  /* bonus test
  it("should return a 400 status code when updating a book with extra keys", async () => {
    const res2 = await request(app).put("/api/books/8").send({
      id: 8,
      title: "Doctor Sleep",
      author: "Stephen King",
      extraKey: "shenanigans"
    });

    expect(res2.statusCode).toEqual(400);
    expect(res2.body.message).toEqual("Bad Request");
  }) */
});

describe("Chapter 6: API Tests", () => {
  it("should log a user in and return a 200 status code with a message of 'Authentication successful'", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "potter"
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Authentication successful");
  });

  it("should return a 401 with a message of 'Unauthorized' when logging in with incorrect credentials", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "porter"
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });

  it("should return a 400 with a message of 'Bad Request' when missing email or password", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });
});

describe("Chapter 7: API Tests", () => {
  it("should return a 200 status code with a message of 'Security questions successfully answered' when validating a user's security questions", async () => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").send({
      securityQuestions: [
        {answer: "Hedwig"},
        {answer: "Quidditch Through the Ages"},
        {answer: "Evans"}
      ]
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Security questions successfully answered");
  });

  it("should return a 400 status code with a message of 'Bad Request' when the request body fails ajv validation", async () => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").send({
      securityQuestions: [
        { answer: "Hedwig", question: "What is your pet's name?" },
        { answer: "Quidditch Through the Ages", myName: "Harry Potter" }
      ]
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return 401 status code with a message of 'Unauthorized' when the security answers are incorrect", async () => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").send({
      securityQuestions: [
        { answer: "Fluffy"},
        { answer: "Quidditch Through the Ages"},
        { answer: "Evans"}
      ]
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });
});