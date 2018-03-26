/* 
	Barrett Otte
	CMSC 495
    
    NOTES:
        - Requires XAMPP server running with Apache and MySQL active.
        - phpmyadmin = http://127.0.0.1:{ApachePort}/phpmyadmin 
        - MovieDB API  https://www.themoviedb.org/documentation/api?language=en
        - Heroku https://hidden-falls-46978.herokuapp.com/
*/



//Import core node modules
var express = require('express');
var http = require('http');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var Promise = require('promise');
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
app.use(express.static(__dirname + '/public')); 


//Assign site constants
const siteTitle = "CRUD APP";
const baseURL = "/";
//const baseURL = "http://localhost:" + app.get('port') + "/";
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
handleDisconnect();


//Setup Database connection and handle timeout problems
function handleDisconnect(){
    dbConnection = mysql.createConnection(db_config);
    console.log("Successfully connected to Database.");
    dbConnection.connect(function(err){
        if(err){
            console.log('Error when connecting to DB: ', err);
            setTimeout(handleDisconnect, 5000);
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



// Connect to Server
var server = app.listen(app.get('port'), function(){
	console.log("Server listening on " + baseURL + " ...");
});



//Query the Movies Table for all movies
function getMovies(){
    return new Promise(function(resolve, reject){
        dbConnection.query("SELECT * FROM Movies ORDER BY movieID DESC", function(err, rows, fields){
            if(err){
                console.log("Error loading from DB");
                return reject(err);
            }
            else{
                return resolve(rows);
            }
        });
    });
}



//Load TMDB image path and overview using movieID
function loadDataTMDB(movieID){
    console.log("Fetching TMDB Data for movieID: " + movieID);
    return new Promise(function(resolve, reject){
        TheMovieDB.movieInfo({id: movieID}, function(err, result){
            if(err){
                return reject(err);
            }
            else{
                return resolve([(TMDB_BasePoster + result.poster_path), result.overview]);
            }
        });
    });
}



//Load All TMDB image paths and overviews using Promises
function loadAllDataTMDB(rows){
    var images = [];
    var overviews = [];
    var promises = [];
    console.log("Fetching data from TMDB.");
    
    return new Promise(function(resolve, reject){
        rows.forEach(function(row, index){
            promises.push(loadDataTMDB(row.movieID).then(function(data){
                images[index] = data[0];
                overviews[index] = data[1];
                console.log("Found image: " + data[0] + " for ID: " + row.movieID);
            }));
        });
        
        if(promises.length == rows.length){
            console.log("All promises have been added.");
            
            Promise.all(promises).then(function(data, err){
                console.log(data);
                if(err){
                    console.log("All TMDB Data Promises were not fulfilled!");
                    return reject(err);
                }
                else{
                    console.log("All TMDB Data Promises were fulfilled!");
                    return resolve([images, overviews]);
                }
            });
        }
    });
}



//Load default page and list DVDs from mySQL DB
app.get('/', function (request, response){
    console.log("Got to Index.");
    getMovies().then(function(rows){
        if(rows.length == 0){
            console.log("Table is empty. Rendering Page...");
            response.render('pages/index.ejs', {
                siteTitle : siteTitle,
                pageTitle : "Movies",
                movies : null
            });
        }
        else{
            console.log("Successfully loaded data from DB.");
            loadAllDataTMDB(rows).then(function(data, err){
                if(err){
                    throw err;
                }
                else{
                    
                    console.log(data[0][0]);
                    console.log(data[0][1]);
                    
                    response.render('pages/index.ejs', {
                        siteTitle : siteTitle,
                        pageTitle : "Movies",
                        movies : rows,
                        images : data[0],
                        overviews : data[1]
                    });
                }
            }).catch(function(e){
                console.log(e.stack);
            });
        }
    }).catch(function(e){
        console.log(e.stack);
    });
    /*response.render('pages/index.ejs', {
                siteTitle : siteTitle,
                pageTitle : "Movies",
            movies : null
            });*/
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
            TMDB_data : result,
        });
    });
});



//Add selected DVD  to DB
app.post('/dvd/add/:movieID', function(request, response){
    
    var id = ("" + request.params.movieID).substring(1, request.params.movieID.length);
    
    TheMovieDB.movieInfo({id: id}, function(err, result){
        
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
            movie : result,
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
    query += " userID = '" + request.body.userID + "'";
    
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






