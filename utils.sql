-- Ran these first
INSERT INTO users (userID, username, password, first_name, last_name, email) VALUES (1, "test", "password", "first", "last", "firstlast@mail.com") ;
INSERT INTO reviews (reviewID, review_title, rating, review, userID, movieID) VALUES (1, "test review", 6, "Test", 1, 1);


-- ALTER TABLE movies add TMDB_ID int NOT NULL;
-- DELETE FROM reviews WHERE reviewID = 11;
DELETE FROM movies WHERE movieID = 0;



INSERT INTO movies (title, genre, rating, year, watched, TMDB_ID, userID)
	VALUES (
		"Spirited Away", "UNIMPLEMENTED", 8.4, 2001, 1, 129,
		(SELECT userID FROM users WHERE userID = 1)
    );

 INSERT INTO movies (title, genre, rating, year, watched, TMDB_ID) VALUES ("Spirited Away", "UNIMPLEMENTED", 8.4, 2001, 1, 129 );
   
    
SELECT * FROM users ORDER BY userID DESC;
SELECT * FROM reviews ORDER BY reviewID DESC;
SELECT * FROM movies ORDER BY movieID DESC;


SET FOREIGN_KEY_CHECKS = 0;
drop table if exists users;
drop table if exists movies;
drop table if exists reviews;
SET FOREIGN_KEY_CHECKS = 1;