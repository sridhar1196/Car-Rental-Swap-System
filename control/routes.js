var itemDB = require('../model/itemDB');

var routes = function(app){
    // GET method for Index and Home page
    app.get(['/','/index'], function(req, res){
        var theUser = req.session.theUser;
        if(theUser == undefined){
            res.render('pages/index', {
                userFirstName: "",
                userLastName: ""
            });
        } else {
            res.render('pages/index', {
                userFirstName: theUser.first_name,
                userLastName: theUser.last_name
            });
        }
    });

    // GET swap function 
    app.get('/swap', function(req, res){
        var theUser = req.session.theUser;
        if(theUser == undefined){
            res.render('pages/swap', {
                userFirstName: "",
                userLastName: ""
            });
        } else {
            res.render('pages/swap', {
                userFirstName: theUser.first_name,
                userLastName: theUser.last_name
            });
        }
    });
    
    // GET about function 
    app.get('/about', function(req, res){
        var theUser = req.session.theUser;
        if(theUser == undefined){
            res.render('pages/about', {
                userFirstName: "",
                userLastName: ""
            });
        } else {
            res.render('pages/about', {
                userFirstName: theUser.first_name,
                userLastName: theUser.last_name
            });
        }
    });

    // GET contact function 
    app.get('/contact', function(req, res){
        var theUser = req.session.theUser;
        if(theUser == undefined){
            res.render('pages/contact', {
                userFirstName: "",
                userLastName: ""
            });
        } else {
            res.render('pages/contact', {
                userFirstName: theUser.first_name,
                userLastName: theUser.last_name
            });
        }
    });
};

module.exports = routes;
