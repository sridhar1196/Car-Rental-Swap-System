function addOfferFeedback(itemsDB, UserID, offerID, rating, callback){
    itemsDB.findoneAndUpdate({OfferID:offerID, UserID:UserID}, function(error, doc){
        if(!error){
            doc.Rating = rating;
            doc.save();
            callback(false);
        } else {
            callback(true);
        }
    });
};

function addItemFeedback(itemsDB, UserID, ItemCode, itemRating, callback){
    itemsDB.findoneAndUpdate({ItemCode:ItemCode, UserID:UserID}, function(error, doc){
        if(!error){
            doc.Rating = itemRating;
            doc.save();
            callback(false);
        } else {
            callback(true);
        }
    });
};

module.exports = {
    addOfferFeedback:addOfferFeedback,
    addItemFeedback:addItemFeedback
}