var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var cors = require("cors");
var path = require("path");
const { response, json } = require("express");

var con = mysql.createConnection({
  host: "localhost",
  database: "node",
  user: "root",
  password: "",
});

var app = express();
app.use(cors());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/login.html"));
});

app.post("/auth", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    con.query(
      "select * from user where username = ? AND password = ?",
      [username, password],
      (error, result, field) => {
        if (result.length > 0) {
          req.session.login = true;
          req.session.username = username;
          res.redirect("/home");
        } else {
          res.send("username and/or password incorrect");
        }
        res.end();
      }
    );
  } else {
    res.send("please enter username and password <a href='/'>click</a>");
    res.end();
  }
});

app.get("/home", (req, res) => {
  if (req.session.login) {
    res.sendFile(path.join(__dirname + "/index.html"));
  } else {
    res.send("please login to view homepage <a href='/'>click</a>");
  }
  // res.end()
});

app.get("/getdata", (req, res) => {
  con.query("select * from user", (error, result, field) => {
    if (result.length > 0) {
      res.send({ data: result });
    } else {
      res.send("no data");
    }
  });
});

app.post("/adduser", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  con.query(
    "insert into user (username, password) value (? , ?)",
    [username, password],
    (error, result, field) => {
      if (error) {
        res.send({ message: error });
      } else {
        res.send({ message: "success" });
      }
    }
  );
});

app.get("/getuserbyid/:userid", (req, res) => {
  var userId = req.params.userid;
  // console.log(userId);
  con.query(
    "select * from user where id = ?",
    [userId],
    (error, result, field) => {
      if (error) {
        console.log(error);
      } else {
        res.send({ data: result });
      }
    }
  );
});

app.post("/edituser", (req, res) => {
  var id = req.body.id;
  var username = req.body.username;
  var password = req.body.password;
  // console.log(req);
  if (id && username && password) {
    con.query(
      "update user set username = ?, password = ? where id = ?",
      [username, password, id],
      (error, result, field) => {
        if (error) {
          console.log(error);
        } else {
          res.send({ message: "update success" });
        }
      }
    );
  } else {
    // console.log(req);
    res.send("no data input");
  }
});

app.delete("/deleteuser", (req, res) => {
  var id = req.body.id;
  // console.log(req);
  con.query("delete from user where id = ?", [id], (error, result, field) => {
    if (error) {
      console.log(error);
    } else {
      res.send({ message: "delete success" });
    }
  });
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname + "/about.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    res.redirect("/");
  });
});

app.get("/exchange", (req, res) => {
  res.sendFile(path.join(__dirname + "/exchange.html"));
});

app.listen(3000);
