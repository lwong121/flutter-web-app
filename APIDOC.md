# Flutter API Documentation
The Flutter API provides information about all posts on Flutter such as the user who made the post, their chosen avatar profile, the date and time they made the post, their post, any hashtags they added, and the number of likes the post has. It also provides a way to add posts or likes.

## Endpoint 1
### Format 1
**Request Format:** /flutter/posts

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Return a json containing all the information on all posts on Flutter such as the id, user, post, hashtag, likes, date and avatar.

**Example Request:** /flutter/posts

**Example Response:**
```json
{
  "posts":[
    {"id":14,"user":"Hope","post":"I am sleepy...","hashtag":"justwokeup","likes":0,"date":"2021-07-27 09:31:43","avatar":"sloth"},{"id":13,"user":"Andy","post":"It is so quiet here...","hashtag":"scared","likes":2,"date":"2021-07-26 23:59:27","avatar":"kangaroo"},{"id":12,"user":"Meki","post":"Koalas are soooo cute!","hashtag":"savethekoalas","likes":6,"date":"2021-07-26 15:58:16","avatar":"koala"},
    {"id":11,"user":"Lauren","post":"Have you guys watched the Olympics yet?","hashtag":"2020olympics","likes":0,"date":"2021-07-26 14:28:17","avatar":"bird"},
    ...
  ]
}
```
### Format 2
**Request Format:** /flutter/posts?trending=true

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Return a json of all data on the top 5 most popular posts on Flutter in descending order, which is determined by the number of likes they have.

**Example Request:** /flutter/posts?trending=true

**Example Response:**
```json
{
  "posts":[
    {"id":6,"user":"Hope","post":"What is everyone up to??","hashtag":"justcurious","likes":21,"date":"2021-07-25 21:37:47","avatar":"cat"},
    {"id":2,"user":"Helen","post":"Hey! What about frogs?","hashtag":"frogsarecooltoo","likes":18,"date":"2021-07-25 14:36:29","avatar":"frog"},
    {"id":1,"user":"Helen","post":"Dolphins are majestic creatures!","hashtag":"","likes":8,"date":"2021-07-25 14:35:47","avatar":"dolphin"},
    {"id":12,"user":"Meki","post":"Koalas are soooo cute!","hashtag":"savethekoalas","likes":6,"date":"2021-07-26 15:58:16","avatar":"koala"},
    {"id":4,"user":"Meki","post":"Take it easy dudes","hashtag":"chillout","likes":4,"date":"2021-07-25 14:37:49","avatar":"sloth"}
  ]
}
```
### Format 3
**Request Format:** /flutter/posts?search="search-term"

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a json containing the post ids of all posts that contain the given search term in the user's name, post, or hashtag.

**Example Request:** /flutter/posts?search=meki

**Example Response:**
```json
{
  "posts":[
    {"id":4},
    {"id":10},
    {"id":12}
  ]
}
```

**Error Handling:**
- Possible 500 (Server Error) errors (all plain text):
  - If something in the server unexpectedly goes wrong, it will return an error with this message: `An error occurred on the server. Try again later.`

## Endpoint 2
**Request Format:** /flutter/post with POST parameters of `user`, `post`, and `avatar`

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** If given valid POST parameters of user, post, and avatar, it adds that new post to the database and returns a JSON of all data on the newly added post. This data may include the id, user, post, hashtag, likes, date, and avatar. The post may or may not include a hashtag, if it does it will be added to the database separate from the post and if it does not the hashtag field will just remain empty.

**Example Request:** /flutter/post with POST body parameters of:
- user: Lauren
- post: Go team USA!!! #Olympics2020
- avatar: bird

**Example Response:**
```json
{
  "id":15,
  "user":"Lauren",
  "post":"Go team USA!!!",
  "hashtag":"Olympics2020",
  "likes":0,
  "date":"2021-07-27 10:21:35",
  "avatar":"bird"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If any one of the body POST parameters are missing, it returns a message saying: `Missing one or more of the required params.`
  - If the given avatar does not exist on Flutter, it returns a message saying: `Yikes. Avatar does not exist.`
- Possible 500 (Server Error) errors (all plain text):
  - If something in the server unexpectedly goes wrong, it will return an error with this message: `An error occurred on the server. Try again later.`

## Endpoint 3
**Request Format:** /flutter/likes with POST parameter of `id`

**Request Type**: POST

**Returned Data Format**: plain text

**Description:** If given a valid post `id` number to update, it will respond with a plain text of the updated number of likes for the post with the given id.

**Example Request:** /flutter/likes with POST parameter of `id=15`

**Example Response:**
```
13
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If there is a missing given id, it responds with a message saying: `Missing the required id param.`
  - If the given id is invalid, it responds with a message saying: `Yikes. ID does not exist.`
- Possible 500 (Server Error) errors (all plain text):
  - If something in the server unexpectedly goes wrong, it will return an error with this message: `An error occurred on the server. Try again later.`

## Endpoint 4
**Request Format:** /flutter/users/:username

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a json containing the information on all posts created by the user with the given username route parameter organized according to date in descending order. This information includes the id, user, post, hashtag, date, likes, and avatar for all of the user's yips.

**Example Request:** /flutter/users/Lauren

**Example Response:**
```json
{
  "posts":[
    {"id":15,"user":"Lauren","post":"Go team USA!!!","hashtag":"Olympics2020","date":"2021-07-27 10:21:35","likes":13,"avatar":"bird"},{"id":11,"user":"Lauren","post":"Have you guys watched the Olympics yet?","hashtag":"2020olympics","date":"2021-07-26 14:28:17","likes":0,"avatar":"bird"},
    {"id":9,"user":"Lauren","post":"Life is Dynamite","hashtag":"","date":"2021-07-26 14:19:52","likes":0,"avatar":"dolphin"},
    {"id":7,"user":"Lauren","post":"I am alright, but it has been getting hotter here!","hashtag":"","date":"2021-07-26 12:15:25","likes":3,"avatar":"cat"},
    {"id":3,"user":"Lauren","post":"It's a hot day today... This fur is not helping.","hashtag":"","date":"2021-07-25 14:37:10","likes":0,"avatar":"bear"}
  ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If there is user in the Flutter database that matches the given username, it responds with a message saying: `Yikes. User does not exist.`
- Possible 500 (Server Error) errors (all plain text):
  - If something in the server unexpectedly goes wrong, it will return an error with this message: `An error occurred on the server. Try again later.`