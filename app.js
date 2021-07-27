/**
 * Name: Lauren Wong
 * Date: June, 2020
 * Description: This is the app.js file which acts as the backend portion for the Flutter website
 * that is inspired by Twitter. This provides information about the posts on the websites such as
 * the user who made the post, the post they made, any hashtags that they used, the current number
 * of likes the post has, and the user's avatar.
 */

"use strict";

const express = require("express");
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const DB_NAME = "flutter.db";
const USER_ERROR = 400;
const SERVER_ERROR = 500;
const AVATARS = ["bear", "bird", "butterfly", "cat", "dolphin", "elephant", "frog", "horse",
                 "kangaroo", "koala", "monkey", "rabbit", "sloth"];

/**
 * Handles 3 different types of GET requests. The first one gets data about all posts on Flutter and
 * responds with a json containing information on the id, user, post, hashtag, likes, date, and
 * avatar for each post. The second request gathers all data on the top 5 most popular posts on
 * Flutter in descending order, which is determined by the number of likes they have. The final
 * request gets data on the posts that match the search term from the given search query parameter
 * and responds with a json containing the post ids.
 */
app.get("/flutter/posts", async (req, res) => {
  try {
    let search = req.query.search;
    let statement;
    let trending = req.query.trending;
    if (!search && !trending) {
      statement = "SELECT * FROM posts ORDER BY DATETIME(date) DESC;";
    } else if (trending === "true") {
      statement = "SELECT * FROM posts ORDER BY likes DESC LIMIT 5;"
    } else {
      search = '%' + req.query.search + '%';
      statement = "SELECT id FROM posts WHERE post LIKE ? OR hashtag LIKE ? OR user LIKE ?;";
    }
    const db = await getDBConnection(DB_NAME);
    let posts = await db.all(statement, [search, search, search]);
    await db.close();
    posts = {"posts": posts};
    res.json(posts);
  } catch (error) {
    res.type("text");
    res.status(SERVER_ERROR).send("An error occurred on the server. Try again later.");
  }
});

/**
 * Handles a POST request to add a new post to the database using the given POST parameters of user
 * and post which represent the name of the user who made the post and their post which may or may
 * not include the hashtag. It responds with a json containing all information on the new post
 * including the id, user, post, hashtag, likes, date, and avatar.
 */
app.post("/flutter/post", async (req, res) => {
  let user = req.body.user;
  let post = req.body.post;
  let avatar = req.body.avatar;
  if (!user || !post || !avatar) {
    res.type("text");
    res.status(USER_ERROR).send("Missing one or more of the required params.");
  } else {
    try {
      if (!AVATARS.includes(avatar)) {
        res.type("text");
        res.status(USER_ERROR).send("Yikes. Avatar does not exist.");
      } else {
        const db = await getDBConnection(DB_NAME);
        let newPost = await addPost(db, user, post, avatar);
        await db.close();
        res.json(newPost);
      }
    } catch (error) {
      res.type("text");
      res.status(SERVER_ERROR).send("An error occurred on the server. Try again later.");
    }
  }
});

/**
 * Updates the database with a new post and returns all the data about that post as a json which
 * includes id, user, post, hashtag, likes, date, and avatar.
 * @param {object} db - connection to the database
 * @param {string} user - name of the user who made the post
 * @param {string} post - the user's post
 * @param {string} avatar - the user's selected avatar
 * @returns {string} json containing all data on the new post
 */
async function addPost(db, user, post, avatar) {
  let msg = post;
  let hashtag = "";
  const regex = /^[\w!?\\. ]* #[a-zA-Z0-9]+$/;
  const found = post.match(regex);
  if (found !== null) {
    msg = post.substring(0, post.indexOf("#")).trim();
    hashtag = post.substring(post.indexOf("#") + 1).trim();
  }
  let statement = "INSERT INTO posts (user, post, hashtag, likes, avatar) VALUES (?, ?, ?, ?, ?)";
  await db.run(statement, [user, msg, hashtag, 0, avatar]);
  let query = "SELECT * FROM posts ORDER BY id DESC LIMIT 1;";
  let newPost = await db.all(query);
  newPost = newPost[0];
  return newPost;
}

/**
 * Handles a POST request to update the current number of likes for the post with the given id from
 * the POST parameter. It responds with a plain text of the updated total number of likes for the
 * post.
 */
app.post("/flutter/likes", async (req, res) => {
  let id = req.body.id;
  res.type("text");
  if (!id) {
    res.status(USER_ERROR).send("Missing one or more of the required params.");
  } else {
    try {
      const db = await getDBConnection(DB_NAME);
      let statement = "SELECT likes FROM posts WHERE id = ?;";
      let likes = await db.all(statement, [id]);
      if (likes.length === 0) {
        res.status(USER_ERROR).send("Yikes. ID does not exist.");
      } else {
        likes = likes[0].likes + 1;
        let query = "UPDATE posts SET likes=? WHERE id=?;";
        await db.run(query, [likes, id]);
        res.send(likes + "");
      }
      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR).send("An error occurred on the server. Try again later.");
    }
  }
});

/**
 * Handles a GET request to get information on all posts created by a given user from the route
 * parameter. It responds with a json containing information on the id, user, post, hashtag, date,
 * likes, and avatar for all of the user's yips organized according to date in descending order.
 */
app.get("/flutter/users/:username", async (req, res) => {
  let username = req.params.username;
  try {
    const db = await getDBConnection(DB_NAME);
    let statement = "SELECT id, user, post, hashtag, date, likes, avatar FROM posts WHERE user = ? ORDER BY DATETIME(date) DESC;";
    let posts = await db.all(statement, [username]);
    await db.close();
    if (posts.length === 0) {
      res.type("text");
      res.status(USER_ERROR).send("Yikes. User does not exist.");
    } else {
      posts = {"posts": posts};
      res.json(posts);
    }
  } catch (error) {
    res.type("text");
    res.status(SERVER_ERROR).send("An error occurred on the server. Try again later.");
  }
});

/**
 * Creates a database connection to the flutter database and returns the database object.
 * @param {string} dbFilePath - the location to store this database
 * @returns {Object} - the database object for the connection
 */
async function getDBConnection(dbFilePath) {
  const db = await sqlite.open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));
const PORT = process.env.PORT || 8080;
app.listen(PORT);