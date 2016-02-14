var _ = require('underscore');
var Helper = require('./helper');

module.exports = function() {
    var that = this;
    this.coordinates = null;
    this.products = {};
    /**
     * inStock
     * needed
     * productWeight
     */
    this.productInfos = {};
    this.orders = [];

    function addOrder(order) {
        this.orders.push(order);
    }

    function getMissingProducts() {
        var missingProducts = {};

        _.each(this.productInfos, function(productInfo, productId) {
            var numberMissing = getAmoutOfMissingProduct(productId);

            if (numberMissing > 0) {
                missingProducts[productId] = numberMissing;
            }
        });

        return missingProducts;
    }

    function getOverFlowProducts() {
        var overflowProducts = {};

        _.each(this.productInfos, function(productInfo, productId) {
            var numberOverflow = getAmoutOfOverflowProduct(productId);

            if (numberOverflow > 0) {
                overflowProducts[productId] = numberOverflow;
            }
        });

        return overflowProducts;
    }

    function getAmoutOfMissingProduct(productId) {
        return that.productInfos[productId].needed - that.productInfos[productId].stock;
    }

    function getAmoutOfOverflowProduct(productId) {
        return that.productInfos[productId].stock - that.productInfos[productId].needed;
    }

    function getTotalMissingProducts() {
        return _.reduce(that.getMissingProducts(), function(sum, value) {
            return sum + value;
        });
    }

    function removeProducts(productObj) {
        if (!hasProductsInStock(productObj)) {
            throw "Try to remove products that doesnt exist";
        }

        _.each(productObj, function(value, productType) {
            that.products[productType] -= value;
        });
    }

    function inStock(productType, number) {
        return this.products[productType] >= number;
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

    function removeItem(productType) {
        this.products[productType] -= 1;
    }

    function getCarriableItemsInStock(config, _products) {
        var clonedWarehouse = _.clone(this);
        var productsInStock = [];
        var currentPayload = 0;

        _products.forEach(function(productType) {
            var productWeight = Helper.getProductWeight(config, productType);

            if (currentPayload + productWeight > config.payload) {
                return;
            }

            if (clonedWarehouse.inStock(productType, 1)) {
                clonedWarehouse.removeItem(productType);
                productsInStock.push(productType);
                currentPayload += productWeight;
            }
        });

        return productsInStock;
    }

    function getProductWeight(productId) {
        return that.productInfos[productId].productWeight;
    }

    this.inStock = inStock;
    this.hasProductsInStock = hasProductsInStock;
    this.removeProducts = removeProducts;
    this.getCarriableItemsInStock = getCarriableItemsInStock;
    this.removeItem = removeItem;
    this.addOrder = addOrder;
    this.getMissingProducts = getMissingProducts;
    this.getOverFlowProducts = getOverFlowProducts;
    this.getTotalMissingProducts = getTotalMissingProducts;
    this.getAmoutOfMissingProduct = getAmoutOfMissingProduct;
    this.getAmoutOfOverflowProduct = getAmoutOfOverflowProduct;
    this.getProductWeight = getProductWeight;
};
