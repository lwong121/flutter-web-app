/**
 * Name: Lauren Wong
 * Date: June, 2020
 * Description: This is the index.js file for the Flutter website which is a simple blogging website
 * inspired by Twitter. On Flutter users can post messages, search through all the posts on the
 * site, like other users' posts, check out all posts from a specific user, and view trending posts
 * on Flutter. If users need some more background information, they can click on the "i" information
 * button in the top right.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  const NEW_POST_DELAY = 2000;

  /**
   * Sets up the page by adding event listeners to the navigation buttons at the top such as the
   * home, post, information, and trending buttons to navigate to a different page when clicked.
   * Adds event listeners to the post and search forms so that when they are submitted, they can
   * either post the message or search for a post. Also prepares the post page for users to submit
   * posts and populates the home page with all existing posts on Flutter.
   */
  function init() {
    id("home-btn").addEventListener("click", showHome);
    id("post-btn").addEventListener("click", showPostPage);
    id("info-btn").addEventListener("click", showInfo);
    id("trending-btn").addEventListener("click", showTrendingPage);
    id("post-form").addEventListener("submit", (event) => {
      event.preventDefault();
      sendPost();
    });
    id("search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      handleSearch();
    });
    setupPostPage();
    getAllPosts();
  }

  /**
   * Prepares the post page by adding the avatar buttons for users to choose their avatar, adding
   * event listeners to remember the entered username, setting the value of the username, adding
   * event listeners to remember the selected avatar, and selecting the avatar on the screen.
   */
  function setupPostPage() {
    addAvatarButtons();
    id("username").addEventListener("keyup", () => {
      let username = id("username").value;
      window.localStorage.setItem("username", username);
    });
    let username = window.localStorage.getItem("username");
    if (username) {
      id("username").value = username;
    } else {
      window.localStorage.setItem("username", "Anonymous");
      id("username").value = "Anonymous";
    }
    let avatar = window.localStorage.getItem("avatar");
    if (avatar) {
      let avatars = qsa("#avatars img");
      for(let i = 0; i < avatars.length; i++) {
        if (avatar === avatars[i].alt) {
          avatars[i].classList.add("selected");
        } else {
          avatars[i].classList.remove("selected");
        }
      }
    } else {
      window.localStorage.setItem("avatar", "bear");
    }
  }

  /**
   * Displays the home page and all posts on the website while hiding all other pages and
   * unselecting all navigation buttons apart from the home button.
   */
  function showHome() {
    id("post").classList.add("hidden");
    id("post-btn").classList.remove("selected");
    id("home").classList.remove("hidden");
    id("home-btn").classList.add("selected");
    id("info").classList.add("hidden");
    id("info-btn").classList.remove("selected");
    id("trending").classList.add("hidden");
    id("trending-btn").classList.remove("selected");
    id("user-posts").classList.add("hidden");
    showPosts();
  }

  /**
   * Displays the post page and sets the username depending on what was entered last. Also hides all
   * other pages and unselects all other buttons.
   */
  function showPostPage() {
    id("home").classList.add("hidden");
    id("home-btn").classList.remove("selected");
    id("post").classList.remove("hidden");
    id("post-btn").classList.add("selected");
    id("info").classList.add("hidden");
    id("info-btn").classList.remove("selected");
    id("trending").classList.add("hidden");
    id("trending-btn").classList.remove("selected");
    id("user-posts").classList.add("hidden");
    id("username").value = window.localStorage.getItem("username");
  }

  /**
   * Displays the information page, hides all other page, and unselects all buttons apart from the
   * information button.
   */
  function showInfo() {
    id("home").classList.add("hidden");
    id("home-btn").classList.remove("selected");
    id("post").classList.add("hidden");
    id("post-btn").classList.remove("selected");
    id("info").classList.remove("hidden");
    id("info-btn").classList.add("selected");
    id("trending").classList.add("hidden");
    id("user-posts").classList.add("hidden");
    id("trending-btn").classList.remove("selected");
  }

  /**
   * Gathers all the posts on flutter from the database.
   */
  function getAllPosts() {
    let url = "/flutter/posts";
    fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => createPosts(res, "home"))
      .catch(handleError);
  }

  /**
   * Creates all the Flutter posts to display on the given page.
   * @param {string} res - json containing data on all Flutter posts
   * @param {string} idName - name of the section to add it to
   */
  function createPosts(res, idName) {
    for (let i = 0; i < res.posts.length; i++) {
      id(idName).appendChild(createPost(res.posts[i]));
    }
  }

  /**
   * Updates the server side with data on the user's new post using the data they entered into the
   * username and post fields as well as which avatar they selected. Clears the post field for the
   * user's next post.
   */
  function sendPost() {
    let url = "/flutter/post";
    let params = new FormData();
    let user = id("username").value.trim();
    params.append("user", user);
    let post = id("post-box").value.trim();
    params.append("post", post);
    let avatars = qsa("#avatars img");
    let avatar = qsa("#avatars img")[0].alt;
    for(let i = 0; i < avatars.length; i++) {
      if(avatars[i].classList.contains("selected")) {
        avatar = avatars[i].alt;
      }
    }
    params.append("avatar", avatar);
    id("post-box").value = "";
    fetch(url, {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(addPost)
      .catch(handleError);
  }

  /**
   * Adds the new post card to the top of the home page and reveals it after a 2 second delay.
   * @param {string} res - json containing all information on the new post
   */
  function addPost(res) {
    id("home").prepend(createPost(res));
    setTimeout(() => {
      showHome();
    }, NEW_POST_DELAY);
  }

  /**
   * Creates a single card for one post containing information on the user who made the post, when
   * they made the post, their post, and the likes.
   * @param {string} res - json containing data on all posts
   * @returns {DOMObject} - section element containing all information on a post
   */
  function createPost(res) {
    let card = gen("section");
    card.id = res.id;
    card.classList.add("card");
    makeHeader(card, res);
    makePost(card, res);
    makeReactions(card, res);
    return card;
  }

  /**
   * Adds all of the metadata on the post such as the user who made the post, the profile photo of
   * their avatar, and the date and time they made the post.
   * @param {DOMObject} card - section element containing all information on a post
   * @param {string} res - json containing data on all posts
   */
  function makeHeader(card, res) {
    let header = gen("section");
    header.classList.add("metadata");
    let userInfo = gen("section");
    let profile = gen("img");
    profile.src = "/img/" + res.avatar + ".png";
    profile.alt = res.avatar;
    profile.classList.add("profile");
    userInfo.appendChild(profile);
    let user = gen("h2");
    user.textContent = res.user;
    userInfo.appendChild(user);
    userInfo.classList.add("user-info");
    userInfo.addEventListener("click", getUserPosts);
    header.appendChild(userInfo);
    addTimes(header, res);
    card.appendChild(header);
  }

  /**
   * Adds the date and time the user made the post to the card.
   * @param {DOMObject} header - section element containing metadata for the user's post
   * @param {string} res - json containing data on all posts
   */
  function addTimes(header, res) {
    let date = gen("p");
    let day = res.date.substring(0, res.date.indexOf(" "));
    let time = res.date.substring(res.date.indexOf(" ") + 1);
    let hour = parseInt(time.substring(0, time.indexOf(":")));
    time = time.substring(time.indexOf(":") + 1);
    time = time.substring(0, time.indexOf(":"));
    if (hour > 12) {
      hour -= 12;
      time = hour + ":" + time + "pm";
    } else {
      time = hour + ":" + time + "am";
    }
    date.textContent = day + " @ " + time;
    header.appendChild(date);
  }

  /**
   * Adds the user's post to the card. If their post included a hashtag, it also adds it to the post.
   * @param {DOMObject} card - section element containing all information on a post
   * @param {string} res - json containing data on all posts
   */
  function makePost(card, res) {
    let post = gen("p");
    post.textContent = res.post;
    card.appendChild(post);
    if (res.hashtag !== "") {
      let hashtag = gen("strong");
      hashtag.textContent = " #" + res.hashtag;
      post.appendChild(hashtag);
    }
    post.classList.add("post");
  }

  /**
   * Adds the like button and the current number of likes to the post's card.
   * @param {DOMObject} card - section element containing all information on a post
   * @param {*} res - json containing data on all posts
   */
  function makeReactions(card, res) {
    let reactionSection = gen("section");
    let reaction = gen("section");
    reaction.classList.add("reaction");
    reaction.id = "reaction";
    let heart = gen("img");
    heart.src = "/img/like.png";
    heart.alt = "like reaction";
    reaction.appendChild(heart);
    let likes = gen("p");
    likes.textContent = res.likes;
    reaction.appendChild(likes);
    reaction.addEventListener("click", likePost);
    reactionSection.appendChild(reaction);
    reactionSection.classList.add("reaction-section");
    card.appendChild(reactionSection);
  }

  /**
   * Displays the trending page, hides all other pages, and unselects all other navigation buttons
   * on the screen. Also clears the trending page and adds a title.
   */
  function showTrendingPage() {
    id("home").classList.add("hidden");
    id("home-btn").classList.remove("selected");
    id("post").classList.add("hidden");
    id("post-btn").classList.remove("selected");
    id("info").classList.add("hidden");
    id("info-btn").classList.remove("selected");
    id("trending").classList.remove("hidden");
    id("trending-btn").classList.add("selected");
    id("trending").innerHTML = "";
    id("user-posts").classList.add("hidden");
    let title = gen("h2");
    title.textContent = "Check out what is trending on Flutter now!"
    id("trending").appendChild(title);
    getTrendingPosts();
  }

  /**
   * Gets the top 5 posts on Flutter with the most likes.
   */
  function getTrendingPosts() {
    let url = "flutter/posts?trending=true";
    fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => createPosts(res, "trending"))
      .catch(handleError);
  }

  /**
   * Likes another user's post by increasing the current like count in the server and updating the
   * user's post card.
   */
  function likePost() {
    let url = "/flutter/likes";
    let params = new FormData();
    let id = this.parentElement.parentElement.id;
    params.append("id", id);
    fetch(url, {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then((res) => {
        this.children[1].textContent = res;
      })
      .catch(handleError);
  }

  /**
   * Adds event listeners to the avatar images on the post page so users can select the avatar they
   * want to use.
   */
  function addAvatarButtons() {
    let avatars = qsa("#avatars img");
    for(let i = 0; i < avatars.length; i++) {
      avatars[i].addEventListener("click", selectAvatar);
    }
  }

  /**
   * Selects the avatar on the page and stores that choice for future use.
   */
  function selectAvatar() {
    let avatars = qsa("#avatars img");
    for(let i = 0; i < avatars.length; i++) {
      avatars[i].classList.remove("selected");
    }
    this.classList.add("selected");
    window.localStorage.setItem("avatar", this.alt);
  }

  /**
   * Gets the results of a search with what the user has written in the search bar. The search will
   * consider the user's name, posts, and hashtags (if applicable). If the user is currently on a
   * page other than the home page, it will hide them and display the results on the homepage.
   */
  function handleSearch() {
    showHome();
    let searchTerm = id("search-box").value.trim();
    if (searchTerm !== "") {
      let url = "/flutter/posts?search=" + searchTerm;
      fetch(url)
        .then(statusCheck)
        .then(res => res.json())
        .then(showSearchResults)
        .catch(handleError);
    }
  }

  /**
   * Displays the search results on the home page.
   * @param {string} res - json containing all the ids of the matching posts
   */
  function showSearchResults(res) {
    showPosts();
    let matches = [];
    for (let i = 0; i < res.posts.length; i++) {
      matches[i] = res.posts[i].id;
    }
    let cards = qsa("#home>section");
    for (let i = 1; i <= cards.length; i++) {
      if (!matches.includes(i)) {
        id(i).classList.add("hidden");
      }
    }
  }

  /**
   * Displays all the posts on the home page.
   */
  function showPosts() {
    let cards = qsa("#home>section");
    for (let i = 1; i <= cards.length; i++) {
      id(i).classList.remove("hidden");
    }
  }

  /**
   * Gets all posts from a specific user.
   */
  function getUserPosts() {
    let url = "flutter/users/" + this.lastElementChild.textContent;
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then(showUserPosts)
    .catch(handleError);
  }

  /**
   * Displays all the posts from a specific user, hides all pages apart from the user posts page, and
   * disables all navigatin buttons. Also adds a heading for the user posts page and adds the posts
   * to the page.
   * @param {*} res
   */
  function showUserPosts(res) {
    id("user-posts").classList.remove("hidden");
    id("home").classList.add("hidden");
    id("home-btn").classList.remove("selected");
    id("post").classList.add("hidden");
    id("post-btn").classList.remove("selected");
    id("trending").classList.add("hidden");
    id("trending-btn").classList.remove("selected");
    id("info").classList.add("hidden");
    id("info-btn").classList.remove("selected");
    id("user-posts").innerHTML = "";
    let heading = gen("h2");
    heading.textContent = "All posts from " + res.posts[0].user;
    id("user-posts").appendChild(heading);
    for (let i = 0; i < res.posts.length; i++) {
      id("user-posts").appendChild(createPost(res.posts[i]));
    }
  }

  /**
   * Checks whether a fetch's response was successful and valid. If successful, it
   * returns the response. Otherwise, it returns the rejected promise with an error
   * and the response in text format.
   * @param {object} res - response to check if valid or not
   * @return {object} - valid response if successful, otherwise a rejected Promise
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Displays the error message on the page and hides all other page views.
   */
  function handleError() {
    let errorSection = gen("section");
    let reaction = gen("h2");
    reaction.textContent = "＼（〇_ｏ）／";
    errorSection.appendChild(reaction);
    let errorMsg = gen("h3");
    errorMsg.textContent = "Sorry, something must have gone wrong.... Reload?";
    errorSection.classList.add("error");
    id("home").classList.add("hidden");
    id("post").classList.add("hidden");
    id("info").classList.add("hidden");
    id("trending").classList.add("hidden");
    id("user-posts").classList.add("hidden");
    errorSection.appendChild(errorMsg);
    qs("main").appendChild(errorSection);
  }

  /**
   * Returns the element with the given idName.
   * @param {string} idName - element ID name
   * @returns {object} - DOM object with the given id name
   */
   function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element with the given CSS selector.
   * @param {string} selector - CSS query selector name
   * @returns {object} - first DOM object that matchest the selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements with the given CSS selector.
   * @param {string} selector - CSS query selector name
   * @returns {object[]} - array of DOM objects that match the selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new element
   * @returns {object} - new DOM object with the given HTML tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();