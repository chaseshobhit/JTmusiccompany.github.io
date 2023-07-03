//LOGIN APP
//Login using mongoDB
const express=require('express');
const app=express();
const PORT=5556;

const bodyParser = require("body-parser");
const request=require("request");
const ejs=require('ejs');


const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

// Connect to MongoDB

mongoose.connect('mongodb://127.0.0.1:27017/Music_Player', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

// Define user schema

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema); //creating a collection

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// Login route

app.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).send('Invalid email or password');
  } 
  else {
    if (user.password !== password) {
      res.status(401).send('Invalid password');
    } 
    else {
      res.cookie('user_id', user._id.toString(), { maxAge: 3600000 }); // Cookie expires after 1 hour
      res.sendFile(__dirname+'/views/index.html');
    }
  }
});

app.get('/signup.html', (req,res)=>{
  res.sendFile(__dirname + '/views/signup.html');
});

app.post('/signup.html', async (req, res) => {
  const { email, password } = req.body;
  // console.log({ email, password });
  const user = new User({ email, password });

  try {
    await user.save();
    res.redirect(302, '/');
  } 
  catch (err) {
    console.error(err);
    res.status(500).send('Error signing up user');
  }
});

app.get('/home.html', (req, res) => {
  if (req.cookies.user_id) {
    res.sendFile(__dirname + '/views/index.html');
  } 
  else {
    res.status(401).send('<h1>LOGGED OUT</h1>');
  }
});

app.use(express.static('public'))
app.use('./styles',express.static(__dirname+'/public/Styles'))
app.use('./scripts',express.static(__dirname+'/public/Scripts'))
app.use('./images',express.static(__dirname+'/public/images'))
app.use('./songs',express.static(__dirname+'/public/songs'))





app.listen(PORT,()=>{
    console.log('Listening');
  });
