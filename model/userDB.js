var itemDB = require('./itemDB');
var item = require('./item');
var user = require('./user');
var useritem = require('./userItem');
var userProfile = require('./userProfile');

//gets all users from user DB
function getUsers(usersDB, callback){
    usersDB.find({},function(err, docs){
        if(!err){
            let users = [];
            console.log("length:"+docs.length);
            for(var i=0;i<docs.length;i++){
                users.push(docs[i]);
            }
            callback(false, users);
        } else {
            callback(true, null);
        }
    });
}

// Check whether email exists or not
function checkEmail(usersDB, email, callback){
    usersDB.find({Email:email}, function(err, doc){
        if(!err && doc.length > 0){
            console.log("emial: ",doc);
            callback(false);
        } else {
            callback(true);
        }
    });
}

// Get information about particular user
function getUser(usersDB, userID, callback){
    usersDB.find({_id: userID},function(err, docs){
        if(!err && docs.length > 0){
            let users = [];
            console.log("length:"+docs.length);
            for(var i=0;i<docs.length;i++){
                users.push(docs[i]);
            }
            callback(false, users);
        } else {
            callback(true, null);
        }
    });
}

// Adding user
function addUser(usersDB, UserID, FirstName, LastName, Email, Add1, Add2, City, State, PostCode, Country, Password, callback){
    var userInstance = new usersDB({_id: UserID, FirstName: FirstName, LastName: LastName, Email: Email, Add1: Add1, Add2: Add2, City: City, State: State, PostCode: PostCode, Country: Country, Password: Password});
    
    userInstance.save(function(err,result){
        if(!err){
            callback(false);
        } else {
            callback(true);
        }
    });
};


function addUserDB(usersDB, itemInstance, callback){
    itemInstance.save(function(error, value){
        if(!error){
            callback(false);
        } else {
            callback(true);
        }
    })
}

// Get userprofile based on user id
function getUserProfile(itemsDB, offerDB, userID, callback){
    let usersID = userID;
    itemsDB.find({UserID: usersID},function(err, docs){
        let useritems = [];
        let error_happ = false;
        let userProfiles = new userProfile(usersID);
        if(!err){
            // categories = [];
            let length = docs.length;
            let j = 0;
            if(docs.length == 0){
                callback(false, userProfiles);
            } else {
                for(var i=0;i<docs.length;i++){
                    // let swap = docs[i];
                    let itemCode = docs[i].ItemCode;
                    let items = docs[i];
                    let status = docs[i].Status;
                    let userRating = docs[i].UserRating;
                    let pendingStatus = docs[i].Initiated;
                    let swapItem;
                    let swapItemRating = "";
                    let swapperRating = "";
                    if((status != "pending") || (status == "pending" && pendingStatus == 1)) {
                        offerDB.find({UserID: userID, ItemCode: itemCode},function(err1, docs1){
                            if(!err1 && docs1.length > 0){
                                let swapItemCode = docs1[0].SwapItemCode;
                                swapItemRating = docs1[0].SwapUserRating;
                                itemsDB.find({ItemCode: swapItemCode},function(err2, docs2){
                                    if(!err2){
                                        swapItem = docs2[0];
                                        j = j + 1;
                                        console.log("j:"+j);
                                        console.log(items.ItemCode);
                                        userProfiles.addItem(new useritem(items, userRating, status, pendingStatus, swapItem, swapItemRating, swapperRating));
                                        if(j == length){
                                            callback(false, userProfiles);
                                        }
                                    } else {
                                        // error_happ = true;
                                        callback(true, cars);
                                    }
                                });
                            } else if (err1){
                                // error_happ = true;
                                callback(true, cars);
                            } else {
                                j = j + 1;
                                console.log("j:"+j);
                                console.log(items.ItemCode);
                                userProfiles.addItem(new useritem(items, userRating, status, pendingStatus, swapItem, swapItemRating, swapperRating));
                                if(j == length){
                                    callback(false, userProfiles);
                                }
                            }
                        });
                    } else if(status == "pending" && pendingStatus == 0){
                        offerDB.find({SwapUserID: userID, SwapItemCode: itemCode},function(err1, docs1){
                            if(!err1 && docs1.length > 0){
                                let swapItemCode = docs1[0].ItemCode;
                                itemsDB.find({ItemCode: swapItemCode},function(err2, docs2){
                                    if(!err2){
                                        swapItem = docs2[0];
                                        swapItemRating = docs2[0].Rating;
                                        j = j + 1;
                                        console.log("j:"+j);
                                        console.log(items.ItemCode);
                                        userProfiles.addItem(new useritem(items, userRating, status, pendingStatus, swapItem, swapItemRating, swapperRating));
                                        if(j == length){
                                            callback(false, userProfiles);
                                        }
                                    } else {
                                        callback(true, cars);
                                    }
                                });
                            } else if (err1){
                                callback(true, cars);
                            } else {
                                j = j + 1;
                                console.log("j:"+j);
                                console.log(items.ItemCode);
                                userProfiles.addItem(new useritem(items, userRating, status, pendingStatus, swapItem, swapItemRating, swapperRating));
                                if(j == length){
                                    callback(false, userProfiles);
                                }
                            }
                        });
                    }
                }
            }
        } else {
            callback(true, cars);
        }
    });
}

// Check whether item is from user profile or not
function checkUserProfileItem(itemsDB, userProfile, itemID, callback){
    if(userProfile != null && itemID != null){
        console.log("User id:"+userProfile.userID);
        console.log("Item id:"+itemID);
        itemsDB.find({UserID: userProfile.userID, ItemCode: itemID},function(err, docs){
            let cars = [];
            if(!err && docs.length > 0){
                // categories = [];
                for(var i=0;i<docs.length;i++){
                    cars.push(docs[i]);
                }
                callback(false, cars);
            } else {
                callback(true, null);
            }
        });
    } else {
        callback(true, null);
    }
}

// Check whether the item is from swap user or not
function checkUserProfileSwapItem(itemsDB, swapDB, userProfile, itemID, callback){
    let userid = userProfile.userID;
    if(userProfile != null && itemID != null){
        swapDB.find({UserID: userid, SwapItemCode: itemID},function(err, docs){
            // let cars = [];
            if(!err && docs.length > 0){
                var itemcode = docs[0].ItemCode;
                itemsDB.find({UserID: docs[0].SwapUserID, ItemCode: itemID},function(err1, docs1){
                    let cars = [];
                    if(!err1 && docs1.length > 0){
                        // categories = [];
                        for(var i=0;i<docs1.length;i++){
                            cars.push(docs1[i]);
                        }
                        callback(false, cars);
                    } else {
                        callback(true, cars);
                    }
                });
            } else {
                callback(true, null);
            }
        });
    } else {
        callback(true, null)
    }
}

function checkUserItems(userID, itemList){
    if(getUserProfile(userID) != null && itemList != null && Array.isArray(itemList)){
        var userProfileItem = getUserProfile(userID).userItems;
        var i = 0;
        var j = 0;
        console.log("User Profile length "+userProfileItem.length+" and item list length "+itemList.length);
        while(i < userProfileItem.length && j < itemList.length){
            if(userProfileItem[i].item.itemCode != itemList[j].item.itemCode){
                return false;
            }
            i++;
            j++;
        }
        // remove this later
        // if((i != (userProfileItem.length - 1)) || ( j != (itemList.length - 1))){
        if((i != (userProfileItem.length)) || ( j != (itemList.length))){
            return false;
        } else {
            return true;
        }
    } else {
        console.log("NUll || not array");
        return false;
    }
}

// Getting max user id
function getMaxID(usersDB, callback){
    usersDB.findOne({}).sort('-_id').exec(function(err,res){
        if(!err){
            console.log(res);
            callback(false, res._id);
        } else {
            callback(true, null);
        }
    });
};

// Check whether email and password is present or not
function validateLogin(usersDB,email, password, callback){
    usersDB.findOne({Email:email, Password:password}, function(error,doc){
        console.log("error:"+error);
        if(!error && doc != undefined){
            callback(false, doc);
        }else{
            callback(true, undefined);
        }
    });
};

module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    getUserProfile: getUserProfile,
    checkUserProfileItem: checkUserProfileItem,
    checkUserItems: checkUserItems,
    checkUserProfileSwapItem: checkUserProfileSwapItem,
    addUser: addUser,
    addUserDB: addUserDB,
    validateLogin: validateLogin,
    getMaxID: getMaxID,
    checkEmail: checkEmail
}
