var express = require('express');
var expressSession = require('express-session');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var routes = require('../control/routes');
var profileController = require('../control/profileController');
var catalogController = require('../control/catalogController');
var bodyParser = require('body-parser');  

var app = express();

mongoose.connect('mongodb://localhost/cccDB', {useNewUrlParser: true});

// Schema for items table
var itemSchema = new mongoose.Schema({
    ItemCode: {type: String, required: true},
    ItemName: {type: String, required:true},
    CatalogCategory: {type: String, required:true},
    Description: {type: String, required:true},
    Rating : Number,
    ImageURL: String,
    UserRating: Number,
    Status: String,
    UserID:{type: Number, required:true},
    Initiated: Number
});

var itemsDB = mongoose.model('items', itemSchema);

// Schema for users table
var userSchema = new mongoose.Schema({
    _id: {type:Number, required: true},
    FirstName: {type: String, required: true},
    LastName: {type: String, required:true},
    Email: {type: String, required:true},
    Password: {type: String, required:true},
    Add1 : String,
    Add2: String,
    City: String,
    State: String,
    PostCode: Number,
    Country: String
});

var userDB = mongoose.model('users', userSchema);

// Schema for swaps table
var swapSchema = new mongoose.Schema({
    UserID: {type: String, required: true},
    SwapUserID: {type: String, required:true},
    ItemCode: {type: String, required:true},
    SwapItemCode: {type: String, required:true},
    SwapUserRating : String
});

var swapDB = mongoose.model('swaps', swapSchema);

// Schema for offers table
var offersSchema = new mongoose.Schema({
    UserID: {type: Number, required: true},
    SwapUserID: {type: Number, required:true},
    ItemCode: {type: String, required:true},
    SwapItemCode: {type: String, required:true},
    SwapUserRating : Number
});

var offerDB = mongoose.model('offers', offersSchema);

// Schema for feedback table
var feedbackSchema = new mongoose.Schema({
    offerID: {type: String, required: true},
    UserID: {type: String, required:true},
    SwapUserID: {type: String, required:true},
    Rating: {type: Number, required:true}
});

var feedbackDB = mongoose.model('Feedbackoffers', feedbackSchema);

// Setting views page for EJS
app.set('view engine', 'ejs');

app.set('views', '../view');

// Adding Express sessions
app.use(expressSession({
    secret: 'id',
    saveUninitialized: false,
    resave: false
}));

// Adding Bidy Parser
app.use(bodyParser.urlencoded({ 
    extended: true 
}));

// Adding express validator
app.use(expressValidator());

app.use('/assets', express.static('../resource'));

// calling routes
routes(app);

//Calling catalogController
catalogController(app, itemsDB, userDB, swapDB, offerDB, feedbackDB);

//Calling profileController
profileController(app, itemsDB, userDB, swapDB, offerDB, feedbackDB);

app.listen(8080); 