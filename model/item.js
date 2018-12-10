var item = function (itemCode, itemName, catalogCategory, description, rating, imageURL) {
    this.itemCode = itemCode;
    this.itemName = itemName;
    this.catalogCategory = catalogCategory;
    this.description = description;
    this.rating = rating;
    this.imageURL = imageURL;

    var itemInfo = {
        itemCode: this.itemCode,
        itemName: this.itemName,
        catalogCategory: this.catalogCategory,
        description: this.description,
        rating: this.rating,
        imageURL: this.imageURL
    }

    return itemInfo;
};

module.exports.item = item;