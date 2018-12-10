var item = require('./item.js');

// get all itema
function getItems(itemsDB, callback){
    itemsDB.find({},function(err, docs){
        if(!err){
            cars = [];
            for(var i=0;i<docs.length;i++){
                cars.push(docs[i]);
            }
            callback(false, cars);
        } else {
            callback(true, null);
        }
    });
};
// Delet item by itemcode and user id
function deleteItem(itemsDB, userID, ItemCode, callback){
    itemsDB.deleteOne({UserID: userID,ItemCode:ItemCode}, function(error,doc){
        if(!error){
            callback(false);
        }else{
            callback(true);
        }
    });
};

// Rating is updated
function updateRating(itemsDB, itemID, itemRating, userRating, callback){
    cars = [];
    itemsDB.findOne({ItemCode: itemID},function(err, docs){
        console.log("docs : "+docs);
        if(!err && docs != undefined){
            //Finding the average
            var newItemRate = Number(((Number(itemRating) + Number(docs.Rating))/2).toFixed(0));
            var newUserRate = Number(((Number(userRating) + Number(docs.UserRating))/2).toFixed(0));
            itemsDB.updateOne({ItemCode:itemID}, {Rating:newItemRate, UserRating: newUserRate}, function(error3, doc3){
                if(!error3){
                    callback(false);
                } else {
                    console.log(error3);
                    callback(true);
                }
            });
        } else {
            callback(true);
        }
    });
};

// Get individual item
function getItem(itemsDB, itemID, callback){
    cars = [];
    itemsDB.find({ItemCode: itemID},function(err, docs){
        if(!err && docs.length > 0){
            for(var i=0;i<docs.length;i++){
                cars.push(docs[i]);
            }
            callback(false, cars);
        } else {
            callback(true, null);
        }
    });
};

// Adding item to items table
function addItem(itemsDB, ItemCode, ItemName, CatalogCategory, Description, Rating, ImageURL, UserID, Status, Initiated, UserRating, callback){
    var itemInstance = new itemsDB({ItemCode: ItemCode, ItemName: ItemName, CatalogCategory: CatalogCategory, Description: Description, Rating: Rating, ImageURL: ImageURL, UserID: UserID, Status: Status, Initiated: Initiated, UserRating: UserRating});
    addItemDB(itemsDB, itemInstance, function(err){
        if(!err){
            callback(false);
        } else {
            callback(true);
        }
    });
};


function addItemDB(itemsDB, itemInstance, callback){
    itemInstance.save(function(error, value){
        if(!error){
            callback(false);
        } else {
            callback(true);
        }
    })
}

// Fetch all unique categories in the item table
function getUniqueCategory(itemsDB, callback){
    itemsDB.find({}).distinct('CatalogCategory', function(err, docs){
        if(!err){
            categories = [];
            for(var i=0;i<docs.length;i++){
                categories.push(docs[i]);
            }
            categories.push("all");
            callback(false, categories);
        } else {
            callback(true, true);
        }
    });
}

// Updating status based on current item status
function updateMultipleStatus(itemsDB, itemCode, swapItemCode, status, callback){
    itemsDB.updateMany({$or:[{ItemCode:itemCode},{ItemCode:swapItemCode}]}, {Status: status}, function(err,val){
        if(!err){
            if(status == "pending"){
                itemsDB.updateOne({ItemCode:itemCode}, {Initiated:1}, function(error2, doc2){
                    if(!error2){
                        itemsDB.updateOne({ItemCode:swapItemCode}, {Initiated:0}, function(error3, doc3){
                            if(!error3){
                                callback(false);
                            } else {
                                console.log(error3);
                                callback(true);
                            }
                        });
                    } else {
                        console.log(error2);
                        callback(true);
                    }
                });
            } else if(status == "swapped"){
                callback(false);
            } else if(status == "available"){
                itemsDB.updateOne({ItemCode:itemCode}, {Initiated:0}, function(error2, doc2){
                    if(!error2){
                        itemsDB.updateOne({ItemCode:swapItemCode}, {Initiated:0}, function(error3, doc3){
                            if(!error3){
                                callback(false);
                            } else {
                                console.log(error3);
                                callback(true);
                            }
                        });
                    } else {
                        console.log(error2);
                        callback(true);
                    }
                });
            }
        }else{
            console.log(err);
            callback(true);
        }
    });
};

// Fetching items information based on the category
function filterCategory(itemsDB, catalogCategory, userID, callback){

    if(catalogCategory == "all"){
        cars = [];
        // itemsDB.find({UserID: {$ne: userID}, Status: {$ne: "pending"}},function(err, docs){
        itemsDB.find({UserID: {$ne: userID}, Status: {$ne: "pending"}},function(err, docs){
            if(!err){
                for(var i=0;i<docs.length;i++){
                    cars.push(docs[i]);
                }
                callback(false, cars);
            } else {
                callback(true, null);
            }
        });
    } else {
        cars = [];
        itemsDB.find({CatalogCategory: catalogCategory, UserID:{$ne: userID}, Status: {$ne: "pending"}},function(err, docs){
        // itemsDB.find({CatalogCategory: catalogCategory, UserID:{$ne: userID}, Status: {$ne: "pending"}},function(err, docs){
            if(!err){
                for(var i=0;i<docs.length;i++){
                    cars.push(docs[i]);
                }
                callback(false, cars);
            } else {
                callback(true, null);
            }
        });
    }
}

// Getting all categories
function getCategory(itemsDB, catalogCategory, callback){
    if(catalogCategory == "all"){
        var val;
        getItems(itemsDB, function(err, values){
            if(!err){
                console.log("Items length:"+values.length);
                callback(false, values);
            } else {
                callback(true, null);
            }
        });
    } else {
        cars = [];
        itemsDB.find({CatalogCategory: catalogCategory},function(err, docs){
            if(!err){
                for(var i=0;i<docs.length;i++){
                    cars.push(docs[i]);
                }
                callback(false, cars);
            } else {
                callback(true, null);
            }
        });
    }
};

module.exports = {
    getItem: getItem,
    getItems: getItems,
    getCategory: getCategory,
    getUniqueCategory: getUniqueCategory,
    filterCategory: filterCategory,
    updateMultipleStatus: updateMultipleStatus,
    addItem: addItem,
    addItemDB: addItemDB,
    deleteItem: deleteItem,
    updateRating: updateRating
}