var _ = require('underscore');

module.exports = function() {
    var coordinates = null;
    var products = {};

    function takeItemsForOrder(order) {
        order.products.forEach(function(product) {
            _products.removeItems(product[0], product[1]);
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
        takeItemsForOrder: takeItemsForOrder,
        products: products,
        canLoad: inStock,
        hasProductsInStock: hasProductsInStock
    }
};
