// function to add offer to the table
function addOffer(offersDB, UserID, SwapUserID, ItemCode, SwapItemCode, callback){
    var offerItem = new offersDB({UserID:UserID,SwapUserID:SwapUserID, ItemCode:ItemCode, SwapItemCode:SwapItemCode});
    offerItem.save(function(error, valuw){
        if(!error){
            callback(false);
        } else {
            console.log(error);
            callback(true);
        }
    });
};

// Deleting the offer from the table
function updateOffer(offersDB, UserID, ItemCode, Initiated, callback){
    if(Initiated == 1){
        offersDB.findOne({UserID:UserID,ItemCode:ItemCode}, function(err1, docs1){
            if(!err1){
                offersDB.deleteOne({UserID:UserID,ItemCode:ItemCode}, function(err, docs){
                    if(!err){
                        callback(false, docs1);
                    }else{
                        callback(true, null);
                    }
                });
            } else {
                callback(true, null);
            }
        });
    }else{
        offersDB.findOne({SwapUserID:UserID,SwapItemCode:ItemCode}, function(err1, docs1){
            if(!err1){
                offersDB.deleteOne({SwapUserID:UserID,SwapItemCode:ItemCode}, function(err, docs){
                    if(!err){
                        callback(false, docs1);
                    } else {
                        callback(true, null);
                    }
                });
            } else {
                callback(true, null);
            }
        });
    }
};

module.exports = {
    addOffer:addOffer,
    updateOffer:updateOffer
}
