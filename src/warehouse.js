var _ = require('underscore');

module.exports = function() {
    var coordinates = null;
    var products = {};

    function removeProducts(productObj) {
        if (!hasProductsInStock(productObj)) {
            throw "Try to remove products that doesnt exist";
        }

        _.each(productObj, function(value, productType) {
            products[productType] -= value;
        });
    }

    function inStock(productType, number) {
        return products[productType] >= number;
    }

    function hasProductsInStock(productObj) {
        var areInStock = true;

        _.each(productObj, function(value, productType) {
            if (!inStock(productType, value)) {
                areInStock = false;
            }
        });

        return areInStock;
    }

    return {
        coordinates: coordinates,
        products: products,
        canLoad: inStock,
        hasProductsInStock: hasProductsInStock,
        removeProducts: removeProducts
    }
};
