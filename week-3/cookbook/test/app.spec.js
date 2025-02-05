const app=require("../src/app");
const request=require("supertest");

describe("Chapter 3: API Tests", () => {
  it("it should return an array of recipes", async () => {
    const res = await request(app).get("/api/recipes");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

    res.body.forEach((recipe) => {
      expect(recipe).toHaveProperty("id");
      expect(recipe).toHaveProperty("name");
      expect(recipe).toHaveProperty("ingredients");
    });
  });

  it("should return a single recipe", async() => {
    const res = await request(app).get("/api/recipes/1");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("name", "Pancakes");
    expect(res.body).toHaveProperty("ingredients", ["flour", "milk", "eggs"]);
  });

  it("should return a 400 error if the id is not a number", async () => {
    const res = await request(app).get("/api/recipes/foo");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });
});

describe("Chapter 4: API Tests", () => {
  it("should return a 201 status code when adding a new recipe", async () => {
    const res = await request(app).post("/api/recipes").send({
      id: 99,
      name: "Grilled Cheese",
      ingredients:["bread", "cheese", "butter"]
    });

    expect(res.statusCode).toEqual(201);
  });

  it("should return a 400 status code when adding a new recipe with missing name", async ()=>{
    const res = await request(app).post("/api/recipes").send({
      id: 100,
      ingredients: ["bread", "cheese", "butter"]
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return a 204 status code when deleting a recipe", async()=>{
    const res = await request(app).delete("/api/recipes/99");

    expect(res.statusCode).toEqual(204);
  });
});

