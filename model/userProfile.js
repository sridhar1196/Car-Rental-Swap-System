var userItem = require('../model/userItem');
function UserProfile (userID) {
    this.userID = userID;
    this.userItems = [];

    this.setUserItem = function(userItems){
        this.userItems = userItems;
    }

    this.getUserItems = function(){
        return this.userItems;
    }

    this.removeItem = function(userItem){
        for(var i = 0; i<this.userItems.length;i++){
            console.log("User item:"+userItem.item.itemCode);
            if(this.userItems[i].item.ItemCode == userItem.item.ItemCode){
                this.userItems.splice(i,1);
            }
        }
    }

    this.emptyProfile = function(){
        for(var i = 0; i<this.userItems.length;i++){
            this.userItems.splice(i, 1);
        }
    }

    this.addItem = function(userInput){
        this.userItems.push(new userItem(userInput.item, userInput.rating, userInput.status, userInput.pendingStatus, userInput.swapItem, userInput.swapItemRating, userInput.swapperRating));
    }
};

module.exports = UserProfile;