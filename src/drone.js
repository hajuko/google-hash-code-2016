var _ = require('underscore');
var Helper = require('./helper');

module.exports = function(id, config) {
    var turns = config.turns;
    var coordinates = config.warehouses[0].coordinates;

    function loadItems(warehouse, productType, number) {
        config.commands.push(id + ' L ' + warehouse.id + ' ' + productType + ' ' + number);
    }

    function loadProducts(products, warehouse) {
        var productObj = Helper.productArrayToObject(products);

        _.each(productObj, function(number, productType) {
            loadItems(warehouse, productType, number);
        });
    }

    function deliverProducts(products, orderId) {
        _.each(products, function(number, productType) {
            deliverItem(orderId, productType, number);
        });
    }

    function deliverOrders(deliveryPlan) {
        _.each(deliveryPlan.products, function(number, productType) {
            loadItems(deliveryPlan.warehouse, productType, number);
        });

        deliveryPlan.additionalOrders.forEach(function(additionalOrder) {
            loadProducts(additionalOrder.products, deliveryPlan.warehouse);
        });

        deliverProducts(deliveryPlan.products, deliveryPlan.order.id);

        coordinates = deliveryPlan.order.coordinates;

        deliveryPlan.additionalOrders.forEach(function(additionalOrder) {
            var productObj = Helper.productArrayToObject(additionalOrder.products);
            deliverProducts(productObj, additionalOrder.id);

            coordinates = additionalOrder.coordinates;
        });

        console.log('delivering order ' + deliveryPlan.order.id + ' to ' + deliveryPlan.order.coordinates);
        turns = deliveryPlan.turnsLeft;
    }

    function deliverItem(orderId, productType, numberOfItems) {
        config.commands.push(id + ' D ' + orderId + ' ' + productType + ' ' + numberOfItems);
    }

    function getTurns() {
        return turns;
    }

    function getCoordinates() {
        return coordinates;
    }

    return {
        id: id,
        getCoordinates: getCoordinates,
        loadItems: loadItems,
        deliverOrders: deliverOrders,
        getTurns: getTurns
    };
};
