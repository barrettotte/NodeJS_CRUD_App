## NodeJS_CRUD_App
Simple CRUD application using NodeJS, ExpressJS, EJS, Bootstrap, and MySQL.
This also works with TheMovieDB API to pull information about Movie releases.
This is meant to be a small tutorial for a DVD rental application.
Hosted at **localhost:3000**

## Database setup 
NOTE: Have not tested this SQL yet since I did this mockup in phpmyadmin
```SQL
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
  ```

## Install Modules
   * body-parser: 1.18.2
   * bootstrap: 4.0.0
   * ejs: 2.5.7
   * express: 4.16.3
   * express-partials: 0.3.0
   * jquery: 3.3.1
   * moviedb: 0.2.10
   * mysql: 2.15.0
   * tether: 1.4.3
  
  ```
    $ npm init
	$ npm install --save express
	$ npm install --save bootstrap
	$ npm install --save ejs
	$ npm install --save jquery
	$ npm install --save mysql
	$ npm install --save moviedb
	$ npm install --save body-parser
	$ npm install --save express-partials
	$ npm install --save tether
  ```
   
   
## Screenshots
![add](https://user-images.githubusercontent.com/15623775/37568694-563230e2-2aaf-11e8-8c5a-ccbe13e26479.PNG)
![edit](https://user-images.githubusercontent.com/15623775/37568701-6a761dac-2aaf-11e8-9a54-c40a34463f9b.PNG)
![index](https://user-images.githubusercontent.com/15623775/37568705-720c5ca2-2aaf-11e8-896b-8967cbb07d86.PNG)
