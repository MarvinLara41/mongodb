// require needed packages
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require("morgan");
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const PORT = process.env.PORT || 3000;

const routes = require("./controller/controller");
app.use("/", routes);



//telling express to use morgan npm
app.use(logger("dev"));
//telling the server how to read the data by express
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

//connect server to the public folder
app.use(express.static(process.cwd()+ "/public"));

//set the app engine
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

//set up connection to mongo
mongoose.connect(process.env.MONGODB_URI ||"mongodb://localhost/scraped_news");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(){
    console.log("connected to MongoDB via Mongoose")
});

//set the port 
app.listen (PORT, function(){
    console.log("Listening on "+ PORT);
})