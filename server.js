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
            title varchar(50) NOT NULL,
            description text NOT NULL,
            quantity int(11) NOT NULL,
            image_url text NOT NULL,
            TMDB_ID int(11) NOT NULL
            release_date date NOT NULL,
            rating varchar(5) NOT NULL,
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
app.use(express.static(__dirname + 'public'));  


//Assign site constants
const portNumber = "3000";
const siteTitle = "CRUD APP";
const baseURL = "http://localhost:" + portNumber + "/";
const TMDB_API_KEY = "244a059cc1db5224bab95119b674815b"; //Oh no don't steal my api key!! D:
const TMDB_BasePoster = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

//Use TheMovieDB API to pull information about movies
const TheMovieDB = require('moviedb')(TMDB_API_KEY);



//Database connection details
const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb"
});



// Connect to Server
var server = app.listen(portNumber, function(){
	console.log("Server listening on 127.0.0.1:" + portNumber + " ...");
});



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



//Display form to Search for DVD Entry to Add
app.get('/dvd/add', function (req, res){
    res.render('pages/add-dvd-search.ejs', {
        siteTitle : siteTitle,
        pageTitle : "Search new DVD",
        items : null,
        isSearch : true,
    });
});



//Display form for quantity of selected DVD
app.get('/dvd/add/:TMDB_ID', function(request, response){
    TheMovieDB.movieInfo({id: request.params.TMDB_ID}, function(err, res){
        response.render('pages/add-dvd.ejs', {
            siteTitle : siteTitle,
            pageTitle : "Add Selected Movie",
            isSearch : false,
            movieData : res
        });
    });
});



//Add selected DVD with specified quantity to DB
app.post('/dvd/add/:TMDB_ID', function(request, response){
    
    var id = (""+request.params.TMDB_ID).substring(1, request.params.TMDB_ID.length);
    
    TheMovieDB.movieInfo({id: id}, function(err, res){
        
        var desc = (res.overview.replace("'", " ")).replace('"', " ");
        
        var query = "INSERT INTO dvdlist (title, description, quantity, " +
                                            "image_url, TMDB_ID, release_date, rating)";
        query += " VALUES ("
            query += " '"   + res.title + "',";
            query += " '"   + desc + "',";
            query += " "    + request.body.quantity + ",";
            query += " '"   + TMDB_BasePoster + res.poster_path + "',";
            query += " "    + id + ",";
            query += " '"   + res.release_date + "',";
            query += " "    + res.vote_average;
        query += ")";
        
        console.log("[ADDING ENTRY] Query  :\n" + query);
        
        connection.query(query, function(err, result){
            if(err) throw err;
            response.redirect(baseURL);
        });
    });
});



//Search for entries of DVDs from TMDB
app.post('/dvd/add', function(request, response){
    
    /*Add logic for looking through already available DVDs here...
        That way we can just add quantity instead of searching again
        for something we already have.
    */
    /*NOTE: Due to limited queries/second from TMDB's API,
        this will only show the first 20 entries. Implementing pages
        would be a workaround for this.
    */
    
    TheMovieDB.searchMovie({query: request.body.title }, function(err, res){
        if(res != null && res.total_results >= 1){
            //console.log(res.results);
            console.log("[ADDING ENTRY] Found " + res.total_results + " results.");
            console.log("[ADDING ENTRY] Loading search results...");
            response.render('pages/add-dvd-search.ejs', {
                siteTitle : siteTitle,
                pageTitle : "Select DVD",
                items : res.results,
            });
        }
        else{
            console.log("[ADDING ENTRY] No search results found.");
            response.redirect(baseURL + 'dvd/add');
        }
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
    query += " release_date = '" + req.body.release_date + "',"
    query += " image_url = '" + req.body.image_url + "',";
    query += " description = '" + req.body.description + "',";
    query += " rating = " + req.body.rating + ",";
    query += " quantity = " + req.body.quantity + "";
    query += " WHERE dvdlist . ID = " + req.body.ID + "";
    
    console.log("[EDITING ENTRY] Query :\n" + query);
    
    connection.query(query, function(err, result){
        if(err) throw err;
        if(result.affectedRows){
            res.redirect(baseURL);   
        }
    });
});



//Delete dvd entry from database
app.get('/dvd/delete/:dvdID', function(req, res){
    
    console.log("[DELETING ENTRY] Deleted Item " + req.params.dvdID);
    
    connection.query("DELETE FROM dvdlist WHERE ID='" + req.params.dvdID + "'", function(err, result){
        if(err) throw err;
        if(result.affectedRows){
            res.redirect(baseURL);
        }
    });
});






