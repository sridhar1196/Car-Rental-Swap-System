var userDB = require('../model/userDB');
var itemDB = require('../model/itemDB');
var offerDB = require('../model/offerDB');
var swapDB = require('../model/swapDB');
var userProfiles = require('../model/userProfile');
var useritem = require('../model/userItem');
const { sanitizeBody } = require('express-validator/filter');
var useritem = require('../model/userItem');
let user = require('../model/user');

// Validation functions to get item index for a given userprofile
function validation(itemsDB, usersDB, swapsDB, offersDB, feedbackDB, req, userID, callback){
    console.log("Query:"+req.query);
    console.log("")
    let theItem = req.query.theItem;
    let usersID = userID;
    let error = false;
    let index = Number.MAX_SAFE_INTEGER;
    // Fetch item information
    itemDB.getItem(itemsDB, theItem, function(err, doc){
        if(err || doc.length == 0){
            callback(true, null);
        } else {
            userDB.getUserProfile(itemsDB, offersDB, usersID, function(err1, val1){
                if(!err1){
                    let itemList = req.session.ItemList;
                    var userProfileItem = req.session.currentProfile.userItems;
                    for(var i = 0;i<userProfileItem.length;i++){
                        console.log("Item Code:"+userProfileItem[i].item.ItemCode);
                        if(userProfileItem[i].item.ItemCode == theItem){
                            index = i;
                            callback(false, i);
                        }
                    }
                    console.log("Index2:"+index);
                    if(index == Number.MAX_SAFE_INTEGER){
                        callback(true, null);
                    }
                } else {
                    callback(true, null);
                }
            });
        }
    });
}

var profileController = function(app, itemsDB, usersDB, swapsDB, offersDB, feedbackDB){
    // GET method for Rating 
    app.get('/rating', function(req, res){
        let theUser = req.session.theUser;
        //  If user is not logged in then sign in page is triggered
        if(theUser == undefined){
            res.render('pages/signin', {
                error: false,
                userFirstName: "",
                userLastName: ""
            });
        } else {
            // If itemcode is defined then categories page is triggered
            if(req.query.theItem == undefined){
                categories = [];
                itemDB.getUniqueCategory(itemsDB, function(er, docs){
                    if(!er){
                        categories = docs;
                    }
                    res.render('pages/categories', {
                        found: false,
                        error: false,
                        userFirstName: theUser.first_name,
                        userLastName: theUser.last_name,
                        type: categories
                    });
                });
            } else {
                if(req.query.itemRating != undefined && req.query.userRating != undefined){
                    let itemCode = req.query.theItem;
                    // Fetching item rating and saving it in table
                    itemDB.updateRating(itemsDB, req.query.theItem, req.query.itemRating, req.query.userRating, function(errs){
                        if(!errs){
                            itemDB.getItem(itemsDB, itemCode, function(error3, docs3){
                                console.log("3:"+error3);
                                if(error3 || docs3.length == 0){
                                    res.render('pages/index', {
                                        found: false,
                                        error: false,
                                        userFirstName: theUser.first_name,
                                        userLastName: theUser.last_name,
                                        status: ""
                                    }); 
                                } else {
                                    console.log("3:"+docs3[0]);
                                    if(docs3[0].Status != "pending"){
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
                                            status: docs3[0].Status,
                                            car: docs3[0]
                                        });
                                    }
                                }
                            });
                        } else {
                            categories = [];
                            itemDB.getUniqueCategory(itemsDB, function(er, docs){
                                if(!er){
                                    categories = docs;
                                }
                                res.render('pages/categories', {
                                    found: false,
                                    error: false,
                                    userFirstName: theUser.first_name,
                                    userLastName: theUser.last_name,
                                    type: categories
                                });
                            });     
                        }
                    });
                } else {
                    // If rating is not entered properly then rating page is triggered again
                    itemDB.getItem(itemsDB, req.query.theItem, function(error3, docs3){
                        if(error3 || docs3.length == 0){
                            res.render('pages/index', {
                                found: false,
                                error: false,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                status: ""
                            }); 
                        } else {
                            res.render('pages/rating', {
                                found: true,
                                error: false,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                status: docs3[0].Status,
                                car: docs3[0]
                            });
                        }
                    });
                }
            }
        }
    });

    // GET method for myItems 
    app.get('/myItems', function(req, res){
        let theUser = req.session.theUser;
        // If user is not logged in then sign in page is triggered
        if(theUser == undefined){
            res.render('pages/signin', {
                error: false,
                userFirstName: "",
                userLastName: ""
            });
        } else if(theUser.user_id > 0){
            var action = req.query.action;
            var userID = theUser.user_id;
            var userProfile = new userProfiles(req.session.currentProfile.userID);
            userProfile.setUserItem(req.session.currentProfile.userItems);
            // Checking user action
            if(action == undefined){
                res.render('pages/myItems', {
                    success: true,
                    userFirstName: theUser.first_name,
                    userLastName: theUser.last_name,
                    userProfile: userProfile
                });
            } else if(action == 'update'){
                // if action is update then fetch index by calling validation then 
                let index = validation(itemsDB, usersDB, swapsDB, offersDB, feedbackDB, req, userID, function(err5, val5){
                    if(err5){
                        res.render('pages/myItems', {
                            success: true,
                            userFirstName: theUser.first_name,
                            userLastName: theUser.last_name,
                            userProfile: userProfile
                        });
                    } else {
                        let index = val5;
                        // If status is pending then myswaps page is triggered
                        console.log("Status:"+userProfile.userItems[index].status);
                        if(userProfile.userItems[index].status.toLowerCase() == 'pending'){
                            var userItem = [];
                            for(var i = 0;i<userProfile.userItems.length;i++){
                                if(userProfile.userItems[i].status.toLowerCase() == 'pending'){
                                    console.log("pending item: "+userProfile.userItems[i].swapItem);
                                    userItem.push(userProfile.userItems[i]);
                                }
                            }
                            res.render('pages/mySwaps', {
                                success: true,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                userItems: userItem
                            });
                        } else if ((userProfile.userItems[index].status.toLowerCase() == 'available') || (userProfile.userItems[index].status.toLowerCase() == 'swapped')){
                            // If the status is available and swapped then item page is triggered
                            res.render('pages/item', {
                                success: true,
                                found: true,
                                error: false,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                status: userProfile.userItems[index].status,
                                car: userProfile.userItems[index].item
                            });
                        } else {
                            res.render('pages/myItems', {
                                success: true,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                userProfile: userProfile
                            });
                        }
                    }
                });
                // Check for action accept, reject and withdraw
            } else if(action == 'accept' || action == 'reject' || action == 'withdraw'){
                var index = validation(itemsDB, usersDB, swapsDB, offersDB, feedbackDB, req, userID, function(err5, val5){
                    if(err5){
                        res.render('pages/myItems', {
                            success: true,
                            userFirstName: theUser.first_name,
                            userLastName: theUser.last_name,
                            userProfile: userProfile
                        });
                    } else {
                        let index = val5;
                        console.log("Index:"+index);
                        // Only for pending these actions are performed
                        if(userProfile.userItems[index].status == 'pending'){ 
                            let userItem = userProfile.userItems[index];
                            if(action == 'reject' || action == 'withdraw'){
                                // Offers table is updated for action reject adn withdraw
                                offerDB.updateOffer(offersDB, userID, userItem.item.ItemCode, userItem.pendingStatus, function(err6, val6){
                                    if(!err6){
                                        itemDB.updateMultipleStatus(itemsDB, userItem.item.ItemCode, userItem.swapItem.ItemCode, 'available', function(err7){
                                            if(!err7){
                                                userItem.status = 'available';
                                                userItem.swapItem = undefined;
                                                userItem.swapItemRating = undefined;
                                                userItem.swapperRating = undefined;

                                                userProfile.userItems[index] = userItem;
                                                req.session.sessionProfile = userProfile;
                                                res.render('pages/myItems', {
                                                    success: true,
                                                    userFirstName: theUser.first_name,
                                                    userLastName: theUser.last_name,
                                                    userProfile: userProfile
                                                });
                                            } else {
                                                req.session.sessionProfile = userProfile;
                                                res.render('pages/myItems', {
                                                    success: true,
                                                    userFirstName: theUser.first_name,
                                                    userLastName: theUser.last_name,
                                                    userProfile: userProfile
                                                });
                                            }
                                        });
                                    } else {
                                        req.session.sessionProfile = userProfile;
                                        res.render('pages/myItems', {
                                            success: true,
                                            userFirstName: theUser.first_name,
                                            userLastName: theUser.last_name,
                                            userProfile: userProfile
                                        });
                                    }
                                });
                            } else if(action == 'accept'){
                                // For action accept, entry is added in swap table and status is updated for both items
                                offerDB.updateOffer(offersDB, userID, userItem.item.ItemCode, userItem.pendingStatus, function(err6, val6){
                                    if(!err6){
                                        itemDB.updateMultipleStatus(itemsDB, userItem.item.ItemCode, userItem.swapItem.ItemCode, 'swapped', function(err7){
                                            if(!err7){
                                                swapDB.addSwap(swapsDB, val6.UserID, val6.SwapUserID, val6.ItemCode, val6.SwapItemCode, userItem.pendingStatus, function(err8){
                                                    if(!err8){
                                                        userItem.status = 'swapped'; 
                                                        userProfile.userItems[index] = userItem;
                                                        req.session.sessionProfile = userProfile;
                                                        res.render('pages/myItems', {
                                                            success: true,
                                                            userFirstName: theUser.first_name,
                                                            userLastName: theUser.last_name,
                                                            userProfile: userProfile
                                                        });    
                                                    } else {
                                                        console.log("addition of swapa error");
                                                        req.session.sessionProfile = userProfile;
                                                        res.render('pages/myItems', {
                                                            success: true,
                                                            userFirstName: theUser.first_name,
                                                            userLastName: theUser.last_name,
                                                            userProfile: userProfile
                                                        });
                                                    }

                                                });
                                            } else {
                                                console.log("update of items error");
                                                req.session.sessionProfile = userProfile;
                                                res.render('pages/myItems', {
                                                    success: true,
                                                    userFirstName: theUser.first_name,
                                                    userLastName: theUser.last_name,
                                                    userProfile: userProfile
                                                });
                                            }
                                        });
                                    } else {
                                        console.log("deletion of offers error");
                                        req.session.sessionProfile = userProfile;
                                        res.render('pages/myItems', {
                                            success: true,
                                            userFirstName: theUser.first_name,
                                            userLastName: theUser.last_name,
                                            userProfile: userProfile
                                        });
                                    }
                                });
                            } 

                        } else {
                            res.render('pages/myItems', {
                                success: true,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                userProfile: userProfile
                            });
                        }
                    }
                });
            } else if(action == 'delete'){
                // Action delete function will delete item in offer table, swap table and item table
                var index = validation(itemsDB, usersDB, swapsDB, offersDB, feedbackDB, req, userID, function(err5, val5){
                    if(err5){
                        res.render('pages/myItems', {
                            success: true,
                            userFirstName: theUser.first_name,
                            userLastName: theUser.last_name,
                            userProfile: userProfile
                        });
                    } else {
                        let index = val5;
                        console.log("index:"+index);
                        console.log("Item Code: "+userProfile.userItems[index].item.ItemCode);
                        // Only availavle item will be deleted
                        if(userProfile.userItems[index].status == "available"){
                            itemDB.deleteItem(itemsDB, userProfile.userID, userProfile.userItems[index].item.ItemCode, function(err6){
                                if(!err6){
                                    userProfile.removeItem(userProfile.userItems[index]);
                                    req.session.sessionProfile = userProfile;
                                    res.render('pages/myItems', {
                                        success: true,
                                        userFirstName: theUser.first_name,
                                        userLastName: theUser.last_name,
                                        userProfile: userProfile
                                    });
                                } else {
                                    req.session.sessionProfile = userProfile;
                                    res.render('pages/myItems', {
                                        success: false,
                                        userFirstName: theUser.first_name,
                                        userLastName: theUser.last_name,
                                        userProfile: userProfile,
                                        error: "Error in deleting item"
                                    });  
                                }
                            });        
                        } else if(userProfile.userItems[index].status == "pending"){
                            res.render('pages/myItems', {
                                success: false,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                userProfile: userProfile,
                                error: "Item with pending status cannot be deleted"
                            });                            
                        } else if(userProfile.userItems[index].status == "swapped"){
                            res.render('pages/myItems', {
                                success: false,
                                userFirstName: theUser.first_name,
                                userLastName: theUser.last_name,
                                userProfile: userProfile,
                                error: "Item with swapped status cannot be deleted"
                            });
                        }
                        // var userItem = userProfile.userItems[index];              
                    }
                });
            } else if(action == 'offer'){
                let theItem = req.query.theItem;
                let usersID = userID;
                let error = false;
                let swapID = req.query.swapItem;
                let index = Number.MAX_SAFE_INTEGER;
                itemDB.getItem(itemsDB, theItem, function(err2, docs){
                    if(!err2){
                        // Fetch item information
                        if(req.query.swapItem != undefined){
                            userDB.getUserProfile(itemsDB, offersDB, usersID, function(err1, val1){
                                if(!err1){
                                    let itemList = req.session.ItemList;
                                    let userProfileItem = req.session.currentProfile.userItems;
                                    for(let i = 0;i<userProfileItem.length;i++){
                                        if(userProfileItem[i].item.ItemCode == theItem){
                                            index = i;
                                        }
                                    }
                                    if(index == Number.MAX_SAFE_INTEGER){
                                        res.render('pages/myItems', {
                                            success: true,
                                            userFirstName: theUser.first_name,
                                            userLastName: theUser.last_name,
                                            userProfile: userProfile
                                        });
                                    } else {
                                        // If offer available item odder is accepted
                                        if(userProfile.userItems[index].status.toLowerCase() == 'available'){
                                            let userItem = userProfile.userItems[index];
                                            itemDB.getItem(itemsDB, req.query.swapItem, function(err2, docs){
                                                if(!err2){
                                                    offerDB.addOffer(offersDB, userID, docs[0].UserID, userItem.item.ItemCode, docs[0].ItemCode, function(err3){
                                                        if(!err3){
                                                            itemDB.updateMultipleStatus(itemsDB, userItem.item.ItemCode, docs[0].ItemCode, "pending", function(err4){
                                                                if(!err4){
                                                                    let ii = docs[0];
                                                                    userItem.status = 'pending';
                                                                    userItem.pendingStatus = '1';
                                                                    userItem.swapItem = ii;
                                                                    userItem.swapItemRating = ii.Rating;
                                                                    userItem.swapperRating = undefined;
                                                                    userProfile.userItems[index] = userItem;
                                                                    req.session.sessionProfile = userProfile;
                                                                    res.render('pages/myItems', {
                                                                        success: true,
                                                                        userFirstName: theUser.first_name,
                                                                        userLastName: theUser.last_name,
                                                                        userProfile: userProfile
                                                                    });
                                                                } else {
                                                                    console.log("update of items error");
                                                                    res.render('pages/myItems', {
                                                                        success: true,
                                                                        userFirstName: theUser.first_name,
                                                                        userLastName: theUser.last_name,
                                                                        userProfile: userProfile
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            console.log("addition of offer error");
                                                            res.render('pages/myItems', {
                                                                success: true,
                                                                userFirstName: theUser.first_name,
                                                                userLastName: theUser.last_name,
                                                                userProfile: userProfile
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    res.render('pages/myItems', {
                                                        success: true,
                                                        userFirstName: theUser.first_name,
                                                        userLastName: theUser.last_name,
                                                        userProfile: userProfile
                                                    });
                                                }
                                            });
                                        } else {
                                            res.render('pages/myItems', {
                                                success: true,
                                                userFirstName: theUser.first_name,
                                                userLastName: theUser.last_name,
                                                userProfile: userProfile
                                            });
                                        }
                                    }
                                } else {
                                    res.render('pages/myItems', {
                                        success: true,
                                        userFirstName: theUser.first_name,
                                        userLastName: theUser.last_name,
                                        userProfile: userProfile
                                    });
                                }
                            });                                
                        } else {
                            var availableItem = [];
                            for(var i = 0;i<userProfile.userItems.length;i++){
                                if((userProfile.userItems[i].status.toLowerCase() == 'available')){
                                    availableItem.push(new useritem(userProfile.userItems[i].item, userProfile.userItems[i].rating, userProfile.userItems[i].status, userProfile.userItems[i].pendingStatus, userProfile.userItems[i].swapItem, userProfile.userItems[i].swapItemRating, userProfile.userItems[i].swapperRating))
                                }
                            }
                            if(availableItem.length > 0){
                                itemDB.getItem(itemsDB, theItem, function(err2, docs){
                                    if(!err2){
                                        res.render('pages/swap', {
                                            success: true,
                                            userFirstName: theUser.first_name,
                                            userLastName: theUser.last_name,
                                            item: docs[0],
                                            availableItem: availableItem
                                        });
                                    }
                                });
                            } else {
                                // If  no available item, error is shown
                                itemDB.getItem(itemsDB, theItem, function(err2, docs){
                                    if(!err2){
                                        res.render('pages/item', {
                                            success: true,
                                            found: true,
                                            userFirstName: theUser.first_name,
                                            userLastName: theUser.last_name,
                                            car: docs[0],
                                            status: "",
                                            error: true,
                                            availableItemError: "Sorry, you do not have any available cars for swapping. Please add more items to start swapping again!"
                                        });
                                    }
                                });
                            }   
                        }
                    } else {
                        res.render('pages/myItems', {
                            success: true,
                            userFirstName: theUser.first_name,
                            userLastName: theUser.last_name,
                            userProfile: userProfile
                        });
                    }
                });
                //Signout functionality
            } else if(action == 'signout'){
                console.log("Coming inside signout");
                req.session.currentProfile = undefined;
                req.session.itemList = undefined;
                req.session.theUser = undefined;
                req.session.sessionProfile = undefined;
                categories = [];

                itemDB.getUniqueCategory(itemsDB, function(er, docs){
                    if(!er){
                        categories = docs;
                    }
                    res.render('pages/categories', {
                        found: false,
                        userFirstName: "",
                        userLastName: "",
                        type: categories
                    });
                });
            } else if(action == 'signin'){
                res.render('pages/signin', {
                    found: false,
                    userFirstName: "",
                    userLastName: ""
                    // type: categories
                });
            }
        } else {
            res.render('pages/signin', {
                error: false,
                userFirstName: "",
                userLastName: ""
            });
        }
    });

    // GET method for register
    app.get('/register', function(req, res){
        var theUser = req.session.theUser;
        if(theUser == undefined){
            res.render('pages/register', {
                userFirstName: "",
                userLastName: "",
                error:false
            });
        } else {
            res.render('pages/index', {
                userFirstName: theUser.first_name,
                error:false,
                userLastName: theUser.last_name
            });
        }
    });

    // POST method to create user
    app.post('/register', function(req, res){
        console.log(req.body);
        if(req.body ==  undefined){
            res.render('pages/register', {
                error: true,
                userFirstName: "",
                userLastName: "",
                showError: "No values are filled in"
            });
        } else {
            // Input validation
            if(req.body.first_name != undefined && 
                req.body.last_name != undefined &&
                req.body.add1 != undefined &&
                req.body.add2 != undefined &&
                req.body.city != undefined &&
                req.body.state != undefined &&
                req.body.country != undefined &&
                req.body.postcode != undefined &&
                req.body.email != undefined &&
                req.body.password != undefined &&
                req.body.conf_password != undefined
                ){
                    req.check('first_name', 'Invalid First Name').isAlpha().isLength({ min: 3 });
                    req.check('last_name', 'Invalid Last Name').isAlpha().isLength({ min: 3 });
                    req.check('add1', 'Invalid Address').isLength({ min: 3 });
                    req.check('city', 'Invalid City').isLength({ min: 2 });
                    req.check('state', 'Invalid State').isLength({ min: 2 });
                    req.check('country', 'Invalid Country').isLength({ min: 2 });
                    req.check('postcode', 'Invalid postcode').isNumeric().isLength({ min: 2 });
                    req.check('email', 'Invalid Email Address').isEmail();
                    req.check('password', 'Invalid Password').isAlphanumeric();
                    req.check('password', 'Confirmation password different from password').equals(req.body.conf_password);
                    var errors = req.validationErrors();
                    console.log(errors);
                    if(errors){
                        res.render('pages/register', {
                            error: true,
                            userFirstName: "",
                            userLastName: "",
                            showError: "Validation erros, Please check entered details"
                        });
                    } else {
                        // Check whether same email exists
                        userDB.checkEmail(usersDB, req.body.email, function(errs1){
                            if(errs1){
                                userDB.getMaxID(usersDB, function(errs, result){
                                    if(!errs){
                                        console.log(result);
                                        userDB.addUser(usersDB, result+1,req.body.first_name, req.body.last_name,req.body.email,req.body.add1,req.body.add2,req.body.city,req.body.state,req.body.postcode,req.body.country,req.body.password,function(result2){
                                            if(!result2){
                                                res.render('pages/signin', {
                                                    error: false,
                                                    userFirstName: "",
                                                    userLastName: ""
                                                });
                                            } else {
                                                res.render('pages/register', {
                                                    error: true,
                                                    userFirstName: "",
                                                    userLastName: "",
                                                    showError: "Error in inserting users into DB"
                                                });
                                            }
                                        });
                                    } else {
                                        res.render('pages/register', {
                                            error: true,
                                            userFirstName: "",
                                            userLastName: "",
                                            showError: "Unable to fetch max users"
                                        });
                                    }
                                });
                            } else {
                                res.render('pages/register', {
                                    error: true,
                                    userFirstName: "",
                                    userLastName: "",
                                    showError: "Email id already exists"
                                });
                            }
                        });
                    }
            } else {
                res.render('pages/register', {
                    error: true,
                    userFirstName: "",
                    userLastName: "",
                    showError: "All fields are not filled"
                });
            }
        }
    });

    // Login functionality
    app.post('/signin', [sanitizeBody('email').trim().escape(), sanitizeBody('psw').trim().escape()],function(req, res){
        console.log(req.body);
        if(req.body ==  undefined){
            res.render('pages/signin', {
                error: true,
                userFirstName: "",
                userLastName: ""
            });
        } else {
            // Input validations
            if(req.body.email != undefined && req.body.psw != undefined){
                req.check('email', 'Invalid Email Address').isEmail();
                req.check('psw', 'Invalid Last Name').isLength({ min: 3 });
                var errors = req.validationErrors();
                if(errors){
                    res.render('pages/signin', {
                        error: true,
                        userFirstName: "",
                        userLastName: ""
                    });
                } else {
                    // Login user
                    userDB.validateLogin(usersDB, req.body.email, req.body.psw, function(error, users){
                        console.log("user:"+users);
                        if(!error){
                            req.session.theUser = new user(users._id, users.FirstName, users.LastName, users.Email, users.Add1, users.Add2, users.City, users.State, users.PostCode, users.Country);
                            console.log(users);
                            userDB.getUserProfile(itemsDB, offersDB, users._id, function(err1, val1){
                                if(!err1){
                                    let userProfile = val1;
                                    console.log("User:"+val1.userID);
                                    console.log("Item:"+val1.userItems.length);
                                    req.session.currentProfile = userProfile;
                                    req.session.ItemList = userProfile.userItems;
                                    req.session.success = true;
                                    res.render('pages/myItems', {
                                        success: true,
                                        userFirstName:  users.FirstName,
                                        userLastName: users.LastName,
                                        userProfile: userProfile
                                    });
                                } else {
                                    res.render('pages/signin', {
                                        error: true,
                                        userFirstName: "",
                                        userLastName: ""
                                    }); 
                                }
                            });
                        }else{
                            res.render('pages/signin', {
                                error: true,
                                userFirstName: "",
                                userLastName: ""
                            });                            
                        }
                    });
                }
            } else {
                res.render('pages/signin', {
                    error: true,
                    userFirstName: "",
                    userLastName: ""
                });
            }
            console.log(req.body);
        }
    });
    // MySwaps page
    app.get('/mySwaps', function(req, res){
        var theUser = req.session.theUser;
        if(theUser == undefined){
            res.render('pages/signin', {
                error: false,
                userFirstName: "",
                userLastName: ""
            });
        } else if(theUser.user_id > 0){
            // Fetching all pending item
            var userProfile = new userProfiles(req.session.currentProfile.userID);
            userProfile.setUserItem(req.session.currentProfile.userItems);
            // console.log(req.session.currentProfile.userItems);
            var pendingItems = [];
            for(var i = 0;i<userProfile.userItems.length;i++){
                if(userProfile.userItems[i].status == 'pending'){
                    pendingItems.push(userProfile.userItems[i]);
                }
            }
            res.render('pages/mySwaps', {
                success: true,
                userFirstName: theUser.first_name,
                userLastName: theUser.last_name,
                userItems: pendingItems
            });
        }
    });
}

module.exports = profileController;