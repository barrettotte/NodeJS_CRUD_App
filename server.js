/* 
	Barrett Otte
	CMSC 495
    
    NOTES:
        - Requires XAMPP server running with Apache and MySQL active.
        - phpmyadmin = http://127.0.0.1:{ApachePort}/phpmyadmin 
        - MovieDB API  https://www.themoviedb.org/documentation/api?language=en
        - Heroku Deployment https://www.youtube.com/watch?v=2OGHdii_42s
        
        - Database Creation SQL:
        
            create database mydb;
            use mydb;
            
            CREATE TABLE Users(
                userID INT(11) NOT NULL AUTO_INCREMENT,
                username VARCHAR(20) NOT NULL,
                first_name VARCHAR(20) NOT NULL,
                last_name VARCHAR(20) NOT NULL,
                email VARCHAR(40) NOT NULL,
                password VARCHAR(20) NOT NULL
                PRIMARY KEY (userID)
            );
            
            CREATE TABLE Movies(
                movieID INT(45) NOT NULL,
                title VARCHAR(45) NOT NULL,
                genre VARCHAR(20) NOT NULL,
                rating VARCHAR(20) NOT NULL,
                year INT(11) NOT NULL,
                watched CHAR(1) NOT NULL,
                userID INT(11) NOT NULL
            );
            
            CREATE TABLE UserReviews(
                reviewID INT(11) NOT NULL AUTO_INCREMENT,
                title VARCHAR(20) NOT NULL,
                quant_review INT(11) NOT NULL,
                qual_review TEXT(255) NOT NULL,
                movieID INT(11) NOT NULL,
                userID INT(11) NOT NULL
            );
*/



//Import core node modules
var express = require('express');
var http = require('http');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var async = require('async');
var app = express();


//Used for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

//View Engine --- Template parsing with EJS types
app.set('view engine', 'ejs');

//Setup Port for Heroku Deployment
app.set('port', (process.env.PORT || 5000));

// Import all JavaScript and CSS files for application
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(express.static(__dirname + 'public'));  


//Assign site constants
const siteTitle = "CRUD APP";
const baseURL = "http://localhost:" + app.get('port') + "/";
const TMDB_API_KEY = "244a059cc1db5224bab95119b674815b"; //Oh no don't steal my api key!! D:
const TMDB_BasePoster = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2/';

//Use TheMovieDB API to pull information about movies
const TheMovieDB = require('moviedb')(TMDB_API_KEY);



//Database connection details for Heroku and ClearDB
const db_config = {
    
    //Heroku Config:
    host: "us-cdbr-iron-east-05.cleardb.net",
    user: "b34f3653f7e526",
    password: "e0578f76",
	database: "heroku_0e9173ce5e46dd4"
    

    
    /*
    //XAMPP Config:
    host: "localhost",
    user: "root",
    password: "root",
    database: "mydb"
    */
};
var dbConnection;



//Fix mySQL timeout problem
function handleDisconnect(){
    dbConnection = mysql.createConnection(db_config);
    dbConnection.connect(function(err){
        if(err){
            console.log('Error when connecting to DB: ', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    dbConnection.on('error', function(err){
        console.log('DB ERROR ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('Lost connection. Reconnecting...');
            handleDisconnect();
        }
        else{
            throw err;
        }
    });
}



//Setup Database connection and handle timeout problems
handleDisconnect();



// Connect to Server
var server = app.listen(app.get('port'), function(){
	console.log("Server listening on " + baseURL + " ...");
});




//Load default page and list DVDs from mySQL DB
app.get('/', function (request, response){
    var images = [];
    var overviews = [];
    
        dbConnection.query("SELECT * FROM Movies ORDER BY movieID DESC", function (err, result){
            
            if(result.length === 0 || result === null){
                console.log("Table is empty.");
                response.render('pages/index.ejs', {
                    siteTitle : siteTitle,
                    pageTitle : "Movies",
                    movies : null,
                    images : null,
                    overviews : null
                }); 
            }
            else{
                result.forEach(function (movie,index){
                    TheMovieDB.movieInfo({id: result[index].movieID}, function(err, data){
                        images[index] = TMDB_BasePoster + data.poster_path;
                        overviews[index] = data.overview;

                        if(overviews.length === result.length){
                            response.render('pages/index.ejs', {
                                siteTitle : siteTitle,
                                pageTitle : "Movies",
                                movies : result,
                                images : images,
                                overviews : overviews
                            });  
                        }
                    });                       
                });
            }  
        });
});



//Display form to Search for Movie Entry to Add
app.get('/dvd/add', function (request, response){
    response.render('pages/add-dvd-search.ejs', {
        siteTitle : siteTitle,
        pageTitle : "Search For Movie",
        movies : null,
    });
});



//Display form for quantity of selected DVD
app.get('/dvd/add/:movieID', function(request, response){
    TheMovieDB.movieInfo({id: request.params.movieID}, function(err, result){
        response.render('pages/add-dvd.ejs', {
            siteTitle : siteTitle,
            pageTitle : "Add Selected Movie",
            TMDB_data : result
        });
    });
});



//Add selected DVD  to DB
app.post('/dvd/add/:movieID', function(request, response){
    
    var id = ("" + request.params.movieID).substring(1, request.params.movieID.length);
    
    TheMovieDB.movieInfo({id: id}, function(err, result){
        
        //var desc = (result.overview.replace("'", " ")).replace('"', " ");
        
        var query = "INSERT INTO Movies (movieID, title, genre, rating, " +
                    "year, watched, userID)";
        query += " VALUES (";
            query += "'" + id + "',";
            query += " '" + result.title + "',";
            query += " 'UNIMPLEMENTED',";   //NOT IMPLEMENTED!
            query += " '" + result.vote_average + "',";
            query += " '" + result.release_date + "',";
            query += " " + "0" + ",";
            query += " " + 12345; // NOT IMPLEMENTED!
        query += ")";
        
        console.log("[ADDING ENTRY] Query  :\n" + query);
        
        dbConnection.query(query, function(err, result){
            if(err) throw err;
            response.redirect(baseURL);
        });
    });
});



//Search for entries of Movies from TMDB
app.post('/dvd/add', function(request, response){
    
    /*Add logic for looking through already available DVDs here...
        That way we can just add quantity instead of searching again
        for something we already have.
    */
    /*NOTE: Due to limited queries/second from TMDB's API,
        this will only show the first 20 entries. Implementing pages
        would be a workaround for this.
    */
    
    TheMovieDB.searchMovie({query: request.body.title }, function(err, result){
        if(result != null && result.total_results >= 1){
            //console.log(res.results);
            console.log("[ADDING ENTRY] Found " + result.total_results + " results.");
            console.log("[ADDING ENTRY] Loading search results...");
            response.render('pages/add-dvd-search.ejs', {
                siteTitle : siteTitle,
                pageTitle : "Select Movie",
                movies : result.results,
            });
        }
        else{
            console.log("[ADDING ENTRY] No search results found.");
            response.redirect(baseURL + 'dvd/add');
        }
    }); 
});



//Display form to edit movie entry
app.get('/dvd/edit/:movieID', function(request, response){
    dbConnection.query("SELECT * FROM Movies WHERE movieID = '" + request.params.movieID + "'", 
    function(err,result){
        response.render('pages/edit-dvd.ejs',{
            siteTitle : siteTitle,
            pageTitle : "Editing Movie : " + result[0].title,
            movie : result
        });
    });
});



//Update movie entry with edited data
app.post('/dvd/edit/:movieID', function(request, response){
    var query = "UPDATE Movies SET";
    query += " title = '" + request.body.title + "',";
    query += " genre = 'UNIMPLEMENTED',";
    query += " rating = '" + request.body.rating + "',";
    query += " year = '" + request.body.release_date + "',";
    query += " watched = '" + request.body.watched + "',";
    query += " userID = '" + request.body.userID + "',";
    
    query += " WHERE movieID = " + request.body.movieID + ";";
    
    console.log("[EDITING ENTRY] Query :\n" + query);
    
    dbConnection.query(query, function(err, result){
        if(err) throw err;
        if(result.affectedRows){
            response.redirect(baseURL);   
        }
    });
});



//Delete movie entry from database
app.get('/dvd/delete/:movieID', function(request, response){
    
    console.log("[DELETING ENTRY] Deleted Item " + request.params.movieID);
    
    dbConnection.query("DELETE FROM Movies WHERE movieID='" + request.params.movieID + "'", 
    function(err, result){
        if(err) throw err;
        if(result.affectedRows){
            console.log("[DELETING ENTRY] REDIRECTING]");
            response.redirect(baseURL);   
        }
    });
});






