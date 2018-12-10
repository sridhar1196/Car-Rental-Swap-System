// function to add swap entry to the table
function addSwap(swapsDB, UserID, SwapUserID, ItemCode, SwapItemCode, Initiated, callback){
    var swapItem = new swapsDB({UserID:UserID,SwapUserID:SwapUserID, ItemCode:ItemCode, SwapItemCode:SwapItemCode});
    swapItem.save(function(error, valuw){
        if(!error){
            callback(false);
        } else {
            callback(true);
        }
    });
};

// Deleting the swap from the table
function updateSwap(swapsDB, UserID, ItemCode, Initiated, callback){
    if(Initiated == 1){
        swapsDB.deleteOne({UserID:UserID,ItemCode:ItemCode}, function(err, docs){
            if(!err){
                callback(false);
            }else{
                callback(true);
            }
        });
    }else{
        swapsDB.deleteOne({SwapUserID:UserID,SwapItemCode:ItemCode}, function(err, docs){
            if(!err){
                callback(false);
            } else {
                callback(true);
            }
        });
    }
};

module.exports = {
    addSwap:addSwap,
    updateSwap:updateSwap
}
