var _ = require('underscore');

module.exports = function(id, config) {
    var products = {};

    function loadItems(warehouseId, productType, number) {
        if (!products[productType]) {
            products[productType] = 0;
        }

        products[productType] += number;

        config.commands.push(id + ' L ' + warehouseId + ' ' + productType + ' ' + number);

        config.warehouses[warehouseId].products[productType] -= number;
    }

    function deliverOrder(orderId, coordinates) {
        _.each(products, function(number, productType) {
            deliverItem(orderId, productType, number);
        });
    }

    function deliverItem(orderId, productType, numberOfItems) {
        products[productType] -= numberOfItems;

        config.commands.push(id + ' D ' + orderId + ' ' + productType + ' ' + numberOfItems);
    }

    function canLoad(productType, number) {
        return getWeight() + config.productWeights[productType] * number <= config.payload;
    }

    function getWeight() {
        var weight = 0;

        _.each(products, function(product, i) {
            weight += product * config.productWeights[i];
        });

        return weight;
    }

    return {
        id: id,
        products: products,
        turns: config.turns,
        coordinates: config.warehouses[0].coordinates,
        getWeight: getWeight,
        canLoad: canLoad,
        loadItems: loadItems,
        deliverOrder: deliverOrder
    }
};
