//need mongoose to connect to Database
const mongoose = require("mongoose");

//create schema

var Schema = mongoose.Schema;
var ArticleSchema= new Schema({
    title: {
        type: String,
        required: true
    },
    link:{
        type: String,
        required:true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports= Article;



