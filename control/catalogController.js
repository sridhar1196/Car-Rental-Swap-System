var itemDB = require('../model/itemDB.js');
var userDB = require('../model/userDB');
var userProfiles = require('../model/userProfile');
var useritem = require('../model/userItem');

var catalogController = function(app, itemsDB, usersDB, swapDB, offerDB, feedbackDB){


    // Getting unique categories
    categories = [];

    itemDB.getUniqueCategory(itemsDB, function(er, docs){
        if(!er){
            categories = docs;
        }
    });

    // GET method for Categories page
    app.get('/categories', function(req, res){
        var theUser = req.session.theUser;
        // Fetching all unique categories
        categories = [];
        itemDB.getUniqueCategory(itemsDB, function(error, docs){
            if(!error){
                categories = docs;
            }
        });
        console.log(categories);
        // Check whether the user has logged in or not
        if(theUser == undefined){
            // User is not logged in
            if(req.query.catalogCategory == undefined){
                categories = [];
                // If both categories and user is not defined then categories page is triggered
                itemDB.getUniqueCategory(itemsDB, function(error, docs){
                    if(!error){
                        categories = docs;
                    }
                    res.render('pages/categories', {
                        found: false,
                        userFirstName: "",
                        userLastName: "",
                        type: categories
                    });
                });
            } else {
                // Fetch all the items based on the selected category
                itemDB.getCategory(itemsDB, req.query.catalogCategory, function(error1, value){
                    if(!error1 && value.length > 0){
                        var arrayVal = [];
                        var newCategoryValue =  [];
                        var category = value[0].CatalogCategory;
                        for(var i=0;i<value.length;i++){
                            if(category != value[i].CatalogCategory){
                                arrayVal.push({
                                    category: category,
                                    value: newCategoryValue
                                });
                                category = value[i].CatalogCategory
                                var newCategoryValue = [];
                                newCategoryValue.push(value[i]);
                            } else {
                                newCategoryValue.push(value[i]);
                            }
                        }
                        arrayVal.push({
                            category: category,
                            value: newCategoryValue
                        });
                        // Sending all the items related to the category
                        res.render('pages/categories', {
                            found: true,
                            userFirstName: "",
                            userLastName: "",
                            type: categories,
                            cars: arrayVal
                        });
                    } else {
                        // In case of fetch error, categories page is triggered again
                        res.render('pages/categories', {
                            found: false,
                            userFirstName: "",
                            userLastName: "",
                            type: categories
                        }); 
                    }
                });
            }
        } else {
            var userID = theUser.user_id;
            var userProfile = new userProfiles(req.session.currentProfile.userID);
            // Fetching user profile based on user id
            userProfile.setUserItem(req.session.currentProfile.userItems);
            // Categories is not defined then the categories page is triggered
            if(req.query.catalogCategory == undefined){
                categories = [];
                itemDB.getUniqueCategory(itemsDB, function(error, docs){
                    if(!error){
                        categories = docs;
                    }
                    res.render('pages/categories', {
                        found: false,
                        userFirstName: theUser.first_name,
                        userLastName: theUser.last_name,
                        type: categories
                    });
                });
            } else {
                // Fetch the items based on category and user id
                itemDB.filterCategory(itemsDB, req.query.catalogCategory, userProfile.userID, function(error2, value){
                    if(error2 || value.length == 0){
                        res.render('pages/categories', {
                            found: false,
                            userFirstName: theUser.first_name,
                            userLastName: theUser.last_name,
                            type: categories
                        }); 
                    } else {
                        var arrayVal = [];
                        var category = value[0].CatalogCategory;
                        var newCategoryValue =  [];
                        for(var i=0;i<value.length;i++){
                            if(category != value[i].CatalogCategory){
                                arrayVal.push({
                                    category: category,
                                    value: newCategoryValue
                                });
                                category = value[i].CatalogCategory
                                var newCategoryValue = [];
                                newCategoryValue.push(value[i]);
                            } else {
                                newCategoryValue.push(value[i]);
                            }
                        }
                        arrayVal.push({
                            category: category,
                            value: newCategoryValue
                        });
                        // Fetching all the values are save it in arrayVal for showing it in categories
                        res.render('pages/categories', {
                            found: true,
                            type: categories,
                            userFirstName: theUser.first_name,
                            userLastName: theUser.last_name,
                            cars: arrayVal
                        });
                    }
                });
            }
        }
        
    });
    
    // GET method for Item page
    app.get('/item', function(req, res){
        var theUser = req.session.theUser;
        // Check whether the user has logged in or not
        if(theUser == undefined){
            // Find whether itemcode is send or not
            if(req.query.itemCode == undefined){
                res.render('pages/categories', {
                    found: false,
                    error: false,
                    userFirstName: "",
                    userLastName: "",
                    type: categories
                });
            } else {
                // Get item and show it show it in item page
                itemDB.getItem(itemsDB, req.query.itemCode, function(error3, docs){
                    if(error3 || docs.length == 0){
                        res.render('pages/item', {
                            found: false,
                            status: "",
                            userFirstName: "",
                            userLastName: "",
                            error: false
                        }); 
                    } else {
                        res.render('pages/item', {
                            found: true,
                            error: false,
                            status: "",
                            userFirstName: "",
                            userLastName: "",
                            car: docs[0]
                        });
                    }
                });
            }
        } else {
            // Displays item based on user id
            var userID = theUser.user_id;
            var userProfile = new userProfiles(req.session.currentProfile.userID);
            userProfile.setUserItem(req.session.currentProfile.userItems);
            // Check whether item and user are interlinked
            userDB.checkUserProfileItem(itemsDB, userProfile, req.query.itemCode, function(error, docs){
                console.log("1:"+docs);
                console.log("1:"+error);
                if(!error){
                    res.render('pages/item', {
                        success: true,
                        found: true,
                        error: false,
                        userFirstName: theUser.first_name,
                        userLastName: theUser.last_name,
                        status: docs[0].Status,
                        car: docs[0]
                    });
                } else {
                    // Check whether item and swapuser are interlinked
                    userDB.checkUserProfileSwapItem(itemsDB, swapDB, userProfile, req.query.itemCode, function(errori, docsi){
                        if(!errori){
                            console.log("2:",docsi[0]);
                            res.render('pages/item', {
                                success: true,
                                found: true,
                                error: false,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                status: docsi[0].Status,
                                car: docsi[0]
                            });
                        } else {
                            console.log("3:");
                            // If item is not linked as user or swapuser then item details are fetched and showed in item page
                            if(req.query.itemCode == undefined){
                                res.render('pages/categories', {
                                    found: false,
                                    error: false,
                                    userFirstName: theUser.first_name,
                                    userLastName: theUser.last_name,
                                    type: categories
                                });
                            } else {
                                itemDB.getItem(itemsDB, req.query.itemCode, function(error3, docs3){
                                    console.log("3:"+docs3[0]);
                                    console.log("3:"+error3);
                                    if(error3 || docs3.length == 0){
                                        res.render('pages/item', {
                                            found: false,
                                            error: false,
                                            userFirstName: theUser.first_name,
                                            userLastName: theUser.last_name,
                                            status: ""
                                        }); 
                                    } else {
                                        if(docs3[0].Status != "pending"){
                                            if(docs3[0].Status != "available"){
                                                res.render('pages/item', {
                                                    found: true,
                                                    error: false,
                                                    userFirstName: theUser.first_name,
                                                    userLastName: theUser.last_name,
                                                    status: docs3[0].Status,
                                                    car: docs3[0]
                                                });
                                            } else {
                                                res.render('pages/item', {
                                                    found: true,
                                                    error: false,
                                                    userFirstName: theUser.first_name,
                                                    userLastName: theUser.last_name,
                                                    status: "",
                                                    car: docs3[0]
                                                });
                                            }
                                        } else {
                                            res.render('pages/item', {
                                                found: true,
                                                error: false,
                                                userFirstName: theUser.first_name,
                                                userLastName: theUser.last_name,
                                                status: docs3[0].Status,
                                                car: docs3[0]
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
    
}


module.exports = catalogController;