/* 
	Barrett Otte
	CMSC 495
*/

//Import core node modules
var express = require('express');
var http = require('http');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();


//Used for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

//Used for formatting dates
var dateFormat = require('dateFormat');
var now = new Date();

//View Engine --- Template parsing with EJS types
app.set('view engine', 'ejs');

// Import all JavaScript and CSS files for application (Bootstrap)
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));



//Database connection details
const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb"
});


//Assign site constants
const portNumber = "4123";
const siteTitle = "CRUD APP";
const baseURL = "http://localhost:" + portNumber;


//Load default page and call data from MySQL DB
app.get('/', function (req, res){
    
    //Get *DVD* List
    //con.query("SELECT * FROM dvdList ORDER BY title DESC", function (err, result)
        res.render('pages/index.ejs', {
            siteTitle : siteTitle,
            pageTitle : "DVD List",
            items : ''//result
        });
    //});
});






// Connect to Server
var server = app.listen(portNumber, function(){
	console.log("Server listening on 127.0.0.1:" + portNumber + " ...");
});





