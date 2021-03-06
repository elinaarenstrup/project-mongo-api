import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import netflixData from "./data/netflix-titles.json";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Show = mongoose.model("Show", {
  show_id: Number,
  title: String,
  director: String,
  cast: String,
  country: String,
  date_added: String,
  release_year: String,
  rating: String,
  duration: String,
  listed_in: String,
  description: String,
  type: String,
});

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Show.deleteMany();

    netflixData.forEach((showData) => {
      new Show(showData).save();
    });
  };

  seedDatabase();
}

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

//Landing page
const listEndpoints = require("express-list-endpoints");

app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

// Route for shows
app.get("/shows", async (req, res) => {
  const { title, director, cast, country, year, genre, type } = req.query;

  //i means ignore case
  const searchShow = await Show.find({
    title: new RegExp(title, "i"),
    director: new RegExp(director, "i"),
    cast: new RegExp(cast, "i"),
    country: new RegExp(country, "i"),
    release_year: new RegExp(year, "i"),
    listed_in: new RegExp(genre, "i"),
    type: new RegExp(type, "i"),
  })
    //sort release year
    .sort({ release_year: -1 });

  //Continue to else if nothing is found using fint
  if (searchShow.length > 0) {
    res.json(searchShow);
  } else {
    res.status(404).json({
      error:
        "Oops! Couldn't find what you are looking for. Try searching for something else",
    });
  }
});

// Route for single show by id
app.get("/shows/:show_id", async (req, res) => {
  const { show_id } = req.params;
  const showById = await Show.findOne({ show_id: show_id });

  if (showById) {
    res.json(showById);
  } else {
    res
      .status(404)
      .json({
        error: `Content with id number: ${req.params.show_id} not found`,
      });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
