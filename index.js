/*
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
const bodyParser = require("body-parser")


mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const { Schema } = mongoose;

const ExerciseSchema = new Schema({
  username: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users", (req, res) => {
  console.log(`req.body`, req.body)
  const newUser = new User({
    username: req.body.username
  })
  newUser.save((err, data) => {
    if(err || !data){
      res.send("There was an error saving the user")
    }else{
      res.json(data)
    }
  })
})

app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params.id
  const {description, duration, date} = req.body
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
    }else{
      const newExercise = new Exercise({
        username: id, 
        description,
        duration,
        date: new Date(), 
      })
      newExercise.save((err, data) => {
        if(err || !data) {
          res.send("There was an error saving this exercise")
        }else {
          const { description, duration, date, _id} = data;
          res.json({
            username: userData.username,
            _id: userData.id,
            description,
            duration,
            date: date.toDateString()
            
          })
        }
      })
    }
  })
})

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const {id} = req.params;
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
    }else{
      let dateObj = {}
      if(from){
        dateObj["$gte"] = new Date().toISOString().slice(0, 10);
      }
      if(to){
        dateObj["$lte"] = new Date().toISOString().slice(0, 10);
      }
      let filter = {
        username: id
      }
      if(from || to ){
        filter.date = dateObj
      }
      let nonNullLimit = limit ?? 500
      Exercise.find(filter).limit(+nonNullLimit).exec((err, data) => {
        if(err || !data){
          res.json([])
        }else{
          const count = data.length
          const rawLog = data
          const {username, _id} = userData;
          const log= rawLog.map((l) => ({
            description: l.description,
            duration: l.duration,
            date: l.date.toDateString()
          }))
          res.json({username, count, _id, log})
        }
      })
    } 
  })
})

app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if(!data){
      res.send("No users")
    }else{
      res.json(data)
    }
  })
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
*/
/*

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const mongoose = require('mongoose');

const mySecret = process.env['MONGO_URI'];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


let exerciseSessionSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
});

let userSchema =  new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseSessionSchema]
});

let Session = mongoose.model('Session', exerciseSessionSchema);
let User = mongoose.model('User', userSchema);

app.post('/api/users', bodyParser.urlencoded({ extended:false }), function (req, res) {
  let newUser = new User({username: req.body.username})
  newUser.save(function (error, savedUser) {
    if(!error){
      let responseObject = {}
      responseObject['username'] = savedUser.username
      responseObject['_id'] = savedUser.id
      res.json(responseObject)
    }
  })

});

app.get('/api/users', function (req, res) {
  User.find({}, function (error, arrayOfUsers) {
    if(!error){
      res.json(arrayOfUsers)
    }
  })

});

app.post('/api/users/:_id/exercises', bodyParser.urlencoded({ extended:false }), function (req, res) {
  let newSession = new Session({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date
  })

 if (newSession.date == "" || newSession.date == undefined) {
    newSession.date = new Date().toISOString().substring(0, 10)
  }

  User.findByIdAndUpdate(
    req.params._id,
    {$push : {log: newSession}},
    {new: true},
    function (error, updatedUser) {
      if(!error){
      let responseObject = {}
      responseObject['_id'] = updatedUser.id
      responseObject['username'] = updatedUser.username
      responseObject['date'] = new Date(newSession.date).toDateString()
      responseObject['description'] = newSession.description
      responseObject['duration'] = newSession.duration
      res.json(responseObject)
    }
  })
});

app.get('/api/users/:_id/logs', (request, response) => {
  
  User.findById(request.params._id, (error, result) => {
    if(!error){
      let responseObject = result
      
      if(request.query.from || request.query.to){
        
        let fromDate = new Date(0)
        let toDate = new Date()
        
        if(request.query.from){
          fromDate = new Date(request.query.from)
        }
        
        if(request.query.to){
          toDate = new Date(request.query.to)
        }
        
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()
        
        responseObject.log = responseObject.log.filter((session) => {
          let sessionDate = new Date(session.date).getTime().toDateString()
          
          return sessionDate >= fromDate && sessionDate <= toDate
          
        })
        
      }
      
      if(request.query.limit){
        responseObject.log = responseObject.log.slice(0, request.query.limit)
      }

      
      responseObject = responseObject.toJSON()
      responseObject['count'] = result.log.length
      response.json(responseObject)
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
}) 
*/
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const mySecret = process.env['MONGO_URI'];

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

// Create the object for User
const userSchema = new mongoose.Schema({ 
  username: String
});
const User = mongoose.model("User", userSchema);

// Create the object for their exercises
const exerciseSchema = new mongoose.Schema({ 
  userid: String,
  username: String,
  description: { type: String, required: true },
  duration: {type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

// Boot up index.hmtl
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Add new user
app.post("/api/users", (req, res) => {
  let newUser = new User({ username: req.body.username });
  newUser.save((err, newUser) => {
    if (err) return console.log(err);
    res.json({ username: newUser.username, _id: newUser._id});
  });
});

// Allow viewing of all users
app.get("/api/users", (req, res) => {
  User.find({}, {username: 1, _id: 1}, (err, data) => {
    if (err) return console.log(err);
    res.send(data);
    //console.log(data);
  });
});

// Add exercises to certain user
app.post("/api/users/:_id/exercises", async (req, res) => {

  const theId = req.params._id;
  const theUser = await User.findById(theId);

  const theExercise = new Exercise({
    userid: theUser._id,
    username: theUser.username,
    description: req.body.description,
    duration: Number(req.body.duration),
    date: req.body.date
      ? new Date(req.body.date).toDateString()
      : new Date().toDateString(),
  });

  await theExercise.save();
  //console.log("Username: " + log.username);
  //console.log("Userid: " + log.theid);
  //console.log("User._id: " + user._id);
  //console.log(log);

  res.json({
    username: theExercise.username,
    description: theExercise.description,
    duration: theExercise.duration,
    date: new Date(theExercise.date).toDateString(),
    _id: theId,
  });
});

// Get logs of exercise from certain user
app.get("/api/users/:_id/logs", async (req, res) => {

  const theId = req.params._id;
  const theLimit = Number(req.query.limit) || 0;
  const theFrom = req.query.from || new Date(0);
  const theTo = req.query.to || new Date(Date.now());
  
  let theUser = await User.findById(theId).exec();
  let userLog = await Exercise.find({ 
    userid: theId, 
    date: { $gte: theFrom , $lte: theTo } })
    .select("-_id -userid -__v")
    .limit(theLimit)
    .exec();

  //console.log(userLog.userid);
  //console.log(theId);

  // This is to convert the date to a string for each date in the array
  const newLog = userLog.map(each => {
    return {
      description: each.description,
      duration: each.duration,
      date: new Date(each.date).toDateString(),
    }
  })

  //console.log(newLog);

  res.json({
    username: theUser.username,
     count: userLog.length,
    _id: theUser._id,
    log: newLog
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
}) 
/*
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

let listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

let uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let exSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exSchema],
  count: { type: Number },
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exSchema);


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    user = new User({ username: username });
    await user.save();

    res.status(200).json(user);
  } else {
    res.status(400).send("This user already exists.");
  }
});

app.get("/api/users", (req, res) => {
  User.find()
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(400).send(error));
});

/* 
Here I had to hardcode the date in order to match the expected date to be tested, since I'm brazilian and my timezone was returning the given date one day earlier.
*/

const getDate = (date) => {
  if (!date) {
    return new Date().toDateString();
  }
  const correctDate = new Date();
  const dateString = date.split("-");
  correctDate.setFullYear(dateString[0]);
  correctDate.setDate(dateString[2]);
  correctDate.setMonth(dateString[1] - 1);

  return correctDate.toDateString();
};

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;

  let exercise = new Exercise({
    description: description,
    duration: duration,
    date: getDate(date),
  });

  await exercise.save();

  User.findByIdAndUpdate(
    req.params._id,
    { $push: { log: exercise } },
    { new: true }
  ).then((result) => {
    let resObj = {};
    resObj["username"] = result.username;
    resObj["_id"] = result._id;
    resObj["date"] = exercise.date;
    resObj["duration"] = exercise.duration;
    resObj["description"] = exercise.description;

    res.json(resObj);
  })
    .catch(error => res.status(400).send(error));
});

app.get("/api/users/:_id/logs", (req, res) => {
  User.findById(req.params._id).then((result) => {

    let resObj = result;

    if (req.query.from || req.query.to) {
      let fromDate = new Date(0);
      let toDate = new Date();

      if (req.query.from) {
        fromDate = new Date(req.query.from);
      }
      
      if (req.query.to) {
        toDate = new Date(req.query.to);
      }

      fromDate = fromDate.getTime();
      toDate = toDate.getTime();

      resObj.log = resObj.log.filter((session) => {
        let sessionDate = new Date(session.date).getTime();
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }
    if (req.query.limit) {
      resObj.log = resObj.log.slice(0, req.query.limit);
    }
    resObj["count"] = result.log.length;
  
       res.json({
    username: result.username,
     count: result.log.length,
    _id: result._id,
    log: result.log,
  });
  });
});


