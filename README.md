## NodeJS_CRUD_App
Simple CRUD application using NodeJS, ExpressJS, EJS, Bootstrap, and MySQL.
This is meant to be a small tutorial for a DVD rental application.
Hosted at **localhost:3000**

## Database setup 
NOTE: Have not tested this SQL yet since I did this mockup in phpmyadmin
```SQL
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
  ```

## Depdendencies
   * body-parser: 1.18.2
   * bootstrap: ^4.0.0
   * ejs: ^2.5.7
   * express: ^4.16.3
   * express-partials: ^0.3.0
   * jquery: ^3.3.1
   * mysql: ^2.15.0
   * tether: ^1.4.3
