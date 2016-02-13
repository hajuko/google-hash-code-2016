var _ = require('underscore');
var Helper = require('./helper');

module.exports = function(id, config) {
    var turns = config.turns;
    var coordinates = config.warehouses[0].coordinates;

    function loadItems(warehouse, productType, number) {
        config.commands.push(id + ' L ' + warehouse.id + ' ' + productType + ' ' + number);
        turns--;
    }

    function deliverOrders(deliveryPlan) {
        _.each(deliveryPlan.products, function(number, productType) {
            loadItems(deliveryPlan.warehouse, productType, number);
        });

        //deliveryPlan.additionalOrders.forEach(function(additionalOrder) {
        //    var productObj = Helper.productArrayToObject(additionalOrder.products);
        //
        //    _.each(productObj, function(number, productType) {
        //        loadItems(deliveryPlan.warehouse, productType, number);
        //    });
        //});

        _.each(deliveryPlan.products, function(number, productType) {
            deliverItem(deliveryPlan, productType, number);
        });

        console.log('delivering order ' + deliveryPlan.order.id + ' to ' + deliveryPlan.order.coordinates);

        turns -= deliveryPlan.distance;

        coordinates = deliveryPlan.order.coordinates;
    }

    function deliverItem(deliveryPlan, productType, numberOfItems) {
        turns--;
        deliveryPlan.products[productType] -= numberOfItems;
        config.commands.push(id + ' D ' + deliveryPlan.order.id + ' ' + productType + ' ' + numberOfItems);
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
    }
};
