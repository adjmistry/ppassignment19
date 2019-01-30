const express = require('express')
const app = express()
var http = require('http');
var url = require('url');
var fs = require('fs');
var session = require('express-session');
var bodyParser     =        require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(
    session({
      secret: "iy98hcbh489n38984y4h498",
      resave: true,
      saveUninitialized: false
    })
  );


app.get('/', (req, res) => {
   res.redirect("/home");
})

app.get('/register', (req, res) => {
    res.render('test.ejs',
    {userMsg: " ",
    fNameMsg: " ",
    sNameMsg: " ",
    pswdMsg: " "});
})

app.get('/home', (req, res) => {
    //res.sendFile(__dirname + "/home.html");
    res.render('homepage.ejs');
})

app.get('/people', (req, res) => {
    var q = url.parse(req.url, true);
    var obj;
    var item;
    console.log(q.pathname);
    var filename = "users.json";
    fs.readFile(filename, function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end("404 Not Found");
      }
      res.writeHead(200, {'Content-Type': 'json'});
      return res.end(data);
    });
})

app.get('/people/:username', (req, res) => {
    var q = url.parse(req.url, true);
    var obj;
    var item = "404 User Not Found";
    console.log(q.pathname);
    var filename = "users.json";
    fs.readFile(filename, 'utf-8', function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end("404 Not Found");
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      obj = JSON.parse(data);
      console.log(req.params.username);
      console.log(obj.length);
      for (i = 0; i < obj.length; i++){
          console.log(obj[i].surname);
          if (obj[i].username === req.params.username){
              item = obj[i];
          }
      }
      res.write(JSON.stringify(item));
      res.body = item;
      console.log(res.body);
      return res.end();
    });
})

app.post('/newTour', (req, res) => {
    console.log(req.session.user);
    var hasNumber = /\d/;
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
                    "October", "November", "December"];
    if(req.session.user){
        if (req.session.user.username !== "admin"){
            return res.status(403).render('login.ejs',
            {userMsg: "",
            pswdMsg: " ",
            loginMsg: "This action requires admin access."});
        }
    }
    else {
        return res.status(403).render('login.ejs',
            {userMsg: "",
            pswdMsg: " ",
            loginMsg: "This action requires admin access."});
    }
    var day = parseInt(req.body.newDay, 10);
    var month = req.body.newMonth;
    var year = parseInt(req.body.newYear, 10);
    var capacity = parseInt(req.body.newCap, 10);
    var maxID = 0;
    var filename = "tours.json";
    var tours = [];
    if (hasNumber.test(month)){
        month = parseInt(month.match(/\d+/)[0], 10);
        month = months[month-1];
        console.log(month);
    }
    fs.readFile(filename, 'utf-8', function(err, data){
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end("404 Not Found");
        }
        obj = JSON.parse(data);
        for (x = 0; x < obj.length; x++){
            if (obj[x].id > maxID){
                maxID = obj[x].id;
            }
        }
        obj.push({"id": maxID+1, "day": day, "month": month, "year": year, "capacity": capacity,
        "bookings": 0, "users": []});
        data = JSON.stringify(obj);
        fs.writeFile('tours.json', data, function(err){
            if(err) {
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end("404 Not Found");
            }
            for (k=0; k<obj.length; k++){
                console.log(obj[k].month);
                if (obj[k].month===month && obj[k].year===year){
                  tours.push({"id": obj[k].id,"day": obj[k].day, "month": month, "year": year,
                       "capacity": obj[k].capacity, "bookings": obj[k].bookings, 
                       "users": obj[k].users});
                }
            }
            console.log(tours);
            return res.render('admin.ejs', 
            {tour: tours, theMonth: month, theYear: year, bookMsg: "Added tour."});
        });
    });
})

app.post('/deleteTour', (req, res) => {
    if (req.session.user){
        if (req.session.user.username !== "admin"){
            return res.status(403).render('login.ejs',
            {userMsg: "",
            pswdMsg: " ",
            loginMsg: "This action requires admin access."});
        }
    }
    else {
        return res.status(403).render('login.ejs',
            {userMsg: "",
            pswdMsg: " ",
            loginMsg: "This action requires admin access."});
    }
    var month = req.body.hidMonth;
    var year = parseInt(req.body.hidYear, 10);
    var filename = "tours.json";
    var tourID = parseInt(req.body.tourNo, 10);
    var tourNo;
    var tours = [];
    fs.readFile(filename, 'utf-8', function(err, data){
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end("404 Not Found");
        }
        obj = JSON.parse(data);
        for (x = 0; x < obj.length; x++){
            if (obj[x].id === tourID){
                tourNo = x;
                console.log(tourNo);
                break;
            }
        }
        obj.splice(tourNo, 1);
        data = JSON.stringify(obj);
        fs.writeFile('tours.json', data, function(err){
            if(err) {
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end("404 Not Found");
            }
            for (k=0; k<obj.length; k++){
                console.log(obj[k].month);
                if (obj[k].month===month && obj[k].year===year){
                  tours.push({"id": obj[k].id,"day": obj[k].day, "month": month, "year": year,
                       "capacity": obj[k].capacity, "bookings": obj[k].bookings, 
                       "users": obj[k].users});
                }
            }
            console.log(tours);
            return res.render('admin.ejs', 
            {tour: tours, theMonth: month, theYear: year, bookMsg: "Deleted tour."});
            
        });
    });

})

app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username + " " + password);
    var filename = "users.json";
    fs.readFile(filename, 'utf-8', function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end("404 Not Found");
      }
      obj = JSON.parse(data);
      for (i = 0; i < obj.length; i++){
          if (obj[i].username === username){
              if (obj[i].password !== password){
                return res.render('login.ejs',
                {userMsg: " ",
                pswdMsg: "Password does not match username.",
                loginMsg: " "});
              }
              else {
                console.log("Username matches password");
                req.session.user = {
                    username: username,
                  };
                  req.session.user.expires = 3600*1000;
                  console.log(req.session.user);
                  if (username === "admin"){
                    getTours("January", 2019, function(tourData){
                    return res.render('admin.ejs', {tour: tourData, theMonth: "January", 
                            theYear: 2019, bookMsg: "Admin page"});
                       })
                    return;
                    }
                  else {
                    return res.redirect('/tours'); 
                  }
              }
          }
      }
      return res.render('login.ejs',
    {userMsg: "User not found.",
    pswdMsg: " ",
    loginMsg: ""});
    });
})

app.get('/login', (req, res) => {
    return res.render('login.ejs',
    {userMsg: " ",
    pswdMsg: " ",
    loginMsg: ""});
})

app.post('/people', (req, res) => {
    var token = req.body.access_token;
    if (!token){
        console.log("ACCESS DENIED");
        res.writeHead(403, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end("403 Access Denied");
    }
    console.log("Got data");
    console.log(req.body);
    var userName = req.body.username.toLowerCase();
    var count = 0;
    var firstName = req.body.fname;
    var lastName = req.body.lname;
    var password = req.body.password;
    console.log(password);
    var newUser;
    var obj;
    
    if (/[^a-z0-9]/i.test(userName) || userName == ""){
        return res.status(400).render("test.ejs", 
        {userMsg: "Invalid username, must contain letters and numbers only.",
        fNameMsg: " ",
        sNameMsg: " ",
        pswdMsg: " "});
    }
    if (/[^a-z]/i.test(firstName) || firstName == ""){
        return res.status(400).render("test.ejs", 
        {userMsg: "\n",
        fNameMsg: "Invalid name, must contain letters only.",
        sNameMsg: " ",
        pswdMsg: " "});
    }
    if (/[^a-z]/i.test(lastName) || lastName == ""){
        return res.status(400).render("test.ejs", 
        {userMsg: " ",
        fNameMsg: " ",
        sNameMsg: "Invalid name, must contain letters only.",
        pswdMsg: " "});
    }
    if (password == ""){
        return res.status(400).render("test.ejs", 
        {userMsg: " ",
        fNameMsg: " ",
        sNameMsg: " ",
        pswdMsg: "Please enter a password."});
    }
    console.log(userName);
    var filename = "users.json";
    fs.readFile(filename, 'utf-8', function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end("404 Not Found");
      }
      //res.writeHead(200, {'Content-Type': 'application/json'});
      obj = JSON.parse(data);
      //console.log(req.params.username);
      console.log(obj.length);
      for (i = 0; i < obj.length; i++){
          //console.log(obj[i].surname);
          if (obj[i].username === userName){
              count = 1;
              console.log("Username found");
            return res.status(400).render("test.ejs", 
            {userMsg: "Username already in use.",
            fNameMsg: " ",
            sNameMsg: " ",
            pswdMsg: " "});
            //res.end();
          }
      }
    if (count === 0){
        console.log("Username is unique.")
        obj.push({"username": userName, "forename": firstName, "surname": lastName, "password": password});
        console.log(obj);
        data = JSON.stringify(obj);
        fs.writeFileSync('users.json', data);
        //data = Buffer.concat(data).toString();
        return res.status(400).render("test.ejs", 
        {userMsg: "All good",
        fNameMsg: " ",
        sNameMsg: " ",
        pswdMsg: " "});
    }
    });
    
});
 
app.all('/logout', (req, res) => {
    if (!req.session.user){
        return res.status(403).render('login.ejs',
        {userMsg: "",
        pswdMsg: " ",
        loginMsg: "Please login to access the rest of the website!"});
    }
    delete req.session.user; // any of these works
        req.session.destroy(); // any of these works
      return res.status(200).redirect('/login');
  })  

app.post('/tours', (req, res) => {
    if (!req.session.user){
        return res.status(403).render('login.ejs',
        {userMsg: "",
        pswdMsg: " ",
        loginMsg: "Please login to access the rest of the website!"});
    }
    console.log("Adding user")
    var tourID = parseInt(req.body.tourNo, 10);
    console.log(tourID);
    var tourUser = req.session.user.username;
    var month = req.body.hidMonth;
    var year = parseInt(req.body.hidYear, 10);
    var tours = [];
    console.log(month+ " " +year);
    console.log(tourUser);
    var filename = "tours.json";
    fs.readFile(filename, 'utf-8', function(err, data) {
        if (err) {
          res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
          return res.end("404 Not Found");
        }
        //res.writeHead(200, {'Content-Type': 'application/json'});
        obj = JSON.parse(data);
        //console.log(obj);
        for (i=0; i<obj.length; i++){
            if (obj[i].id === tourID){
                console.log(obj[i].users);
                for (j=0; j<obj[i].users.length; j++){
                    if (obj[i].users[j] === tourUser){
                        console.log("User already subscribed");
                        console.log(obj[i].users[j]);
                        getTours(month, year, function(tourData){
                            return res.render('tours.ejs', {tour: tourData, theMonth: month, 
                                theYear: year, bookMsg: "You are already booked onto this tour!"});
                           })
                        return;
                    }
                }
                obj[i].users.push(tourUser);
                obj[i].bookings = obj[i].users.length;
                console.log(obj[i].bookings);
                console.log(obj[i].users);
                break;
            }
        }
        
        data = JSON.stringify(obj);
        fs.writeFile('tours.json', data, function(err){
            if(err) {
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end("404 Not Found");
            }
            for (k=0; k<obj.length; k++){
                console.log(obj[k].month);
                if (obj[k].month===month && obj[k].year===year){
                  tours.push({"id": obj[k].id,"day": obj[k].day, "month": month, "year": year,
                       "capacity": obj[k].capacity, "bookings": obj[k].bookings, 
                       "users": obj[k].users});
                }
            }
            console.log(tours);
            return res.render('tours.ejs', 
            {tour: tours, theMonth: month, theYear: year, bookMsg: "Booked tour."});
        });
            
        //return res.end()
      });
    
})

function getTours(month, year, tourData){
    filename = 'tours.json';
    var tours = [];
    fs.readFile(filename, 'utf-8', function(err, data) {
        if (err) {
          res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
          return res.end("404 Not Found");
        }
        //res.writeHead(200, {'Content-Type': 'application/json'});
        obj = JSON.parse(data);
        for (i=0; i<obj.length; i++){
            console.log(obj[i].month);
            console.log(obj[i].month===month && obj[i].year===year);
            if (obj[i].month===month && obj[i].year===year){
              tours.push({"id": obj[i].id,"day": obj[i].day, "month": month, "year": year,
                   "capacity": obj[i].capacity, "bookings": obj[i].bookings, 
                   "users": obj[i].users});
            }
        }
        console.log("getTours");
        console.log(tours);
        console.log(tours.length);
        tourData(tours);
      });

}

app.get('/tours', (req, res) => {
    console.log(req.session);
    var template = 'tours.ejs';
    if (!req.session.user){
        return res.status(403).render('login.ejs',
        {userMsg: "",
        pswdMsg: " ",
        loginMsg: "Please login to access the rest of the website!"});
    }
    else if (req.session.user.username === "admin"){
        template = 'admin.ejs';
    }
    var q = url.parse(req.url, true);
    console.log(q);
    var month = q.query.thisMonth;
    var year = parseInt(q.query.thisYear, 10);
    if (!month){
        month = "January";
        year = 2019;
    }
   getTours(month, year, function(tourData){
    return res.render(template, {tour: tourData, theMonth: month, theYear: year, bookMsg: ""});
   })
})

app.get('/admin', (req, res) => {
    if(req.session.user){
        if (req.session.user.username !== "admin"){
            return res.status(403).render('login.ejs',
            {userMsg: "",
            pswdMsg: " ",
            loginMsg: "This action requires admin access."});
        }
    }
    else {
        return res.status(403).render('login.ejs',
            {userMsg: "",
            pswdMsg: " ",
            loginMsg: "This action requires admin access."});
    }
    getTours("January", 2019, function(tourData){
        return res.render('admin.ejs', {tour: tourData, theMonth: "January", theYear: 2019, bookMsg: ""});
       })
})



module.exports = app