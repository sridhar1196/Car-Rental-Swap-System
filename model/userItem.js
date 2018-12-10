function UserItem(item, rating, status, pendingStatus, swapItem, swapItemRating, swapperRating) {
    this.item = item;
    this.rating = rating;
    this.status = status;
    this.pendingStatus = pendingStatus;
    this.swapItem = swapItem;
    this.swapItemRating = swapItemRating;
    this.swapperRating = swapperRating;
};

module.exports = UserItem;