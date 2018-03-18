/* 
	Barrett Otte
	CMSC 495
    
    NOTES:
        - Requires XAMPP server running with Apache and MySQL active.
        - phpmyadmin = http://127.0.0.1:{ApachePort}/phpmyadmin 
        - MovieDB API  https://www.themoviedb.org/documentation/api?language=en
        
        - DVD Entry Columns: (? = optional)
            - Title (VARCHAR (25))
            - URL to MovieDB for Cover Image    (TEXT)
            - Description from MovieDB          (TEXT)
            - Quantity Available to Rent        (INT)
            - Rating from MovieDB               (INT)  ?
            - Genre from MovieDB                (VARCHAR(XX)) ?
            - URL to trailer from MovieDB       (TEXT) ?
            - Release Data                      (DATE) ?
            
        - Database Creation SQL:
        
            create database mydb;
            use mydb;
            
            CREATE TABLE dvdlist(
            ID int(11) NOT NULL auto_increment,
            title varchar(25) NOT NULL,
            description text NOT NULL,
            quantity int(11) NOT NULL,
            image_url text NOT NULL,
            PRIMARY KEY (ID)
            );
*/



//Import core node modules
var express = require('express');
var http = require('http');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();


//Used for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

//View Engine --- Template parsing with EJS types
app.set('view engine', 'ejs');

// Import all JavaScript and CSS files for application
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));



//Database connection details
const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb"
});


//Assign site constants
const portNumber = "3000";
const siteTitle = "CRUD APP";
const baseURL = "http://localhost:" + portNumber + "/";



//Load default page and list DVDs from mySQL DB
app.get('/', function (req, res){
    connection.query("SELECT * FROM dvdlist ORDER BY ID DESC", function (err, result){
        res.render('pages/index.ejs', {
            siteTitle : siteTitle,
            pageTitle : "DVD List",
            items : result
        });
    });
});


//Display form to add dvd entry
app.get('/dvd/add', function (req, res){
    res.render('pages/add-dvd.ejs', {
        siteTitle : siteTitle,
        pageTitle : "Add new DVD",
        items : ''
    });
});


//Add entry to dvd database
app.post('/dvd/add', function(req, res){
    var query = "INSERT INTO dvdlist (title, description, quantity, image_url)";
    query += " VALUES ("
    query += " '" + req.body.title + "',";
    query += " '" + req.body.description + "',";
    query += " " + req.body.quantity + ",";
    query += " '" + req.body.image_url + "')";
    
    console.log("Query from /dvd/add  :\n" + query);
    
    connection.query(query, function(err, result){
        if(err) throw err;
        res.redirect(baseURL);
    });
});



//Display form to edit dvd entry
app.get('/dvd/edit/:dvdID', function(req, res){
    connection.query("SELECT * FROM dvdlist WHERE ID = '" + req.params.dvdID + "'", function(err,result){
        res.render('pages/edit-dvd.ejs',{
            siteTitle : siteTitle,
            pageTitle : "Editing DVD : " + result[0].title,
            item : result
        });
    });
});


//Update dvd entry with edited data
app.post('/dvd/edit/:dvdID', function(req, res){
    var query = "UPDATE dvdlist SET";
    query += " title = '" + req.body.title + "',";
    query += " description = '" + req.body.description + "',";
    query += " image_url = '" + req.body.image_url + "',";
    query += " quantity = " + req.body.quantity + "";
    query += " WHERE dvdlist . ID = " + req.body.ID + "";
    
    console.log("Query from /dvd/edit  :\n" + query);
    
    connection.query(query, function(err, result){
        if(err) throw err;
        if(result.affectedRows){
            res.redirect(baseURL);   
        }
    });
});


//Delete dvd entry from database
app.get('/dvd/delete/:dvdID', function(req, res){
    console.log("Deleting entry " + req.params.dvdID);
    connection.query("DELETE FROM dvdlist WHERE ID='" + req.params.dvdID + "'", function(err, result){
        if(err) throw err;
        if(result.affectedRows){
            res.redirect(baseURL);
        }
    });
});





// Connect to Server
var server = app.listen(portNumber, function(){
	console.log("Server listening on 127.0.0.1:" + portNumber + " ...");
});





