//this file is the logic behind the app

//these are the needed for the routing 
const express = require("express");
const router = express.Router();
const path = require("path");

//these are needed for the scraping of the app
const request = require("request");
const cheerio = require("cheerio");

//connections to the model folder
const Comment = require("../models/comments");
const Article = require("../models/article");

//creation of the first route
router.get("/", function(req, res){
    res.redirect("/article");
})


//get request to the website I want to scrape
router.get("/scrape", function(req, res){
    request("https://www.theverge.com/", function(error, response, html) {
        var $ = cheerio.load(html);
        var titleArray = [];
        $(".c-entry-box--compact__title").each(function(i, element){
            var result= {};

            result.title = $(this)
            .children("a")
            .text();

            result.link = $(this)
            .children("a")
            .attr("href");

            if(result.title !== " " && result.link !== " "){

                if (titleArray.indexOf(result.title) == -1){
                    titleArray.push(result.title);

                    Article.count({title: result.title}, function(err, test){
                        if (test ===0){
                            var entry = new Article(result);
                            entry.save(function(err, doc){
                                if (err){
                                    console.log(err);
                                }else{
                                    console.log(doc);
                                }
                            })
                        }
                    })
                }else{
                    console.log("article exists");
                }
            }else{
                console.log("not saved to DB")
            }
        });
        res.redirect("/");
    })
})

//grabbing the articles to populate the DOM
router.get("/article", function(req,res){
    Article.find().sort({__id: -1}).exec(function(err,doc){
        if (err){
            console.log(err);
        }else{
            var art = { article: doc};
            res.render("index", art);
        }
    })
})

//get the json files for the articles 
router.get("/article-json", function(req,res){
    Article.find({}, function(err, doc){
        if (err){
            console.log(err);
        }else {
            res.json(doc);
        }
    });
});



router.get("/clearAll", function (req,res){
    Article.remove({}, function (err,doc){
        if (err){
            console.log(err);
        }else{
            console.log("removed all articles");
        }
    });
    res.redirect("/articles-json")
})



router.get("/readArticle/:id", function (req,res){
    console.log("running /readArticle")
    
    var articleId= req.params.id;
    var hbsObj = {
        article: [],
        body: []
    };


    Article.findOne({__id: articleId})
    .populate("comments")
    .exec(function(err, doc){
        if (err){
            console.log("error "+ err);
        }else{
            hbsObj.article=doc;
            var link = doc.link;
            request(link, function(error, response, html){
                var $ = cheerio.load(html);

                $(".l-col__main").each(function(i, element){
                    hbsObj.body = $(this)
                    .children(".c-entry-content")
                    .children("p")
                    .text();

                    res.render("article", hbsObj);
                    return false;
                })
            })
        }
    })
});



router.post("/comment/:id", function(req,res){
    var user = req.body.name;
    var content = req.body.comment;
    var articleId= req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function(err, doc){
        if (err){
            console.log(err);
        }else{
            console.log(doc.__id);
            console.log(articleId);

            Article.findOneAndUpdate(
                {__id: req.params.id},
                {$push: {comments: doc._id}},
                {new: true}
            ).exec(function(err, doc){
                if (err){
                    console.log(err);
                }else{
                    res.redirect("/readArticle"+ articleId);
                }
            })
        }
    });
});
module.exports= router;