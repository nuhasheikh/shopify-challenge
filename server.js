const express = require('express');
const path = require('path');

let app = express();

const fs = require("fs");
const fetch = require("node-fetch");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));

app.set("view engine", "pug");
let nominees = [];
let globalSearch = "";

app.get("/", function(req, res){
  res.render("search.pug", {"movies":'', "search": '', "nominees": nominees});
  globalSearch = "";
})

app.post('/searchMovie', function(req, res){
    if(req.body == null){
        res.status(404).send("Not a valid Movie")
    }else{
        res.redirect("/movies?search="+ req.body.movie);
    }
})

app.post('/nominateMovie/:movie', function(req, res){
    let length = Object.keys(nominees).length;
    let splitStr = req.params.movie.split("&");
    let obj = {"Title": splitStr[0], "Year": splitStr[1]}

    if(length < 5){
      let bool = false;
      for(let i = 0; i < nominees.length; i++){
        if(nominees[i].Title == obj.Title){
          bool = true;
        }
      }
      if(bool == false){nominees.push(obj);}
    }
    res.redirect("/movies?search="+ globalSearch);
})

app.post('/denominateMovie/:movie', function(req, res){
      for(let i = 0; i < nominees.length; i++){
        if(nominees[i].Title == req.params.movie){
          nominees.splice(i, 1);
        }
      }
      res.redirect("/movies?search="+ globalSearch);
})

app.get("/movies", function (req, res){
    globalSearch = req.query.search;

    fetch(`http://www.omdbapi.com/?apikey=75d2a3b4&s=${req.query.search}`)
      .then( (response) => {return response.json();})
      .then( (data) => {
        if(data.Search == undefined){
          res.render("search.pug", {"movies": '', "search": '', "nominees": nominees});
        }else{
          res.status(200).render("search.pug", {"movies": data.Search, "search": req.query.search, "nominees": nominees});
        }
      })
      .catch( (error) => {console.log("Error");})
})

app.listen(3000);
console.log("Server listening at http://localhost:3000");
