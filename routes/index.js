var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
const co = require('co');

//var url = 'mongodb://localhost:27017/';
var url = 'mongodb://34.125.41.169:27017/';

var datab = 'test'

var userID = null
const User = require('../User');
const { currentId } = require('async_hooks');
let users = [];
let getUserInstance = uid => users.find(user => user.id === uid);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

//demo

//store userID and load first activity
router.post('/activity/', function(req,res,next){

  //prompt to enter username if null
  if (!req.body.userID) {
    res.render('index', {error: "ERROR: Please enter a username"});
    return;
  }

  //Fetch current user
  let currentUser = getUserInstance(req.body.userID);
  
  //add new user if not already exists based on id
  if (!currentUser) {
    users.push(new User(req.body.userID));
    currentUser = getUserInstance(req.body.userID);
  }

  questionNum = currentUser.selectQuestion()
  console.log(questionNum)

  //store user in db
  co(function* () {

    let client = yield MongoClient.connect(url);
    const db = client.db(datab)
    let usersCol = db.collection('users')

    check = yield usersCol.findOne({"user" : currentUser.id})
              
    //check to see if user exists in database
    if(check === null && currentUser.id != null){
              
      //insert new user if user does not exist
      var item = { 
        "user": currentUser.id,
        "key2pay": null,
        "surveyResults": null,
      };
                
      yield usersCol.insertOne(item);

      res.render('activity', {userID: currentUser.id, question: questionNum, sequence: currentUser.question})
              
    } 

    else{
      res.render('index', {error: "ERROR: Username already exists"})
    }
  });
});

//load every other activity
router.post('/activity/:userID', function(req,res,next){

  //Fetch current user
  let currentUser = getUserInstance(req.params.userID);
  currentUser.nextquestion()
  
  questionNum = currentUser.selectQuestion()
  console.log(currentUser)

  if (currentUser.question < 15){
    res.render('activity', {userID: currentUser.id, question: questionNum, sequence: currentUser.question})
  }
  else{
    res.render('activity'
  }

});

//Store data

router.post('activity/:userID/data', function(req,res,next){
  
  userID = req.params.userID;
  let group = Object.keys(req.body)
  group = JSON.parse(group)
  console.log(group)

});




module.exports = router;
