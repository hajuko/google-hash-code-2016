var _ = require('underscore');
var Helper = require('./helper');

module.exports = function(id, config) {
    var turns = config.turns;
    var coordinates = config.warehouses[0].coordinates;

    function loadItems(warehouse, productType, number) {
        config.commands.push(id + ' L ' + warehouse.id + ' ' + productType + ' ' + number);
    }

    function deliverOrders(deliveryPlan) {
        _.each(deliveryPlan.products, function(number, productType) {
            loadItems(deliveryPlan.warehouse, productType, number);
        });

        deliveryPlan.additionalOrders.forEach(function(additionalOrder) {
            var productObj = Helper.productArrayToObject(additionalOrder.products);

            _.each(productObj, function(number, productType) {
                loadItems(deliveryPlan.warehouse, productType, number);
            });
        });

        _.each(deliveryPlan.products, function(number, productType) {
            deliverItem(deliveryPlan.order.id, productType, number);
        });

        coordinates = deliveryPlan.order.coordinates;

        deliveryPlan.additionalOrders.forEach(function(additionalOrder) {
            var productObj = Helper.productArrayToObject(additionalOrder.products);

            _.each(productObj, function(number, productType) {
                deliverItem(additionalOrder.id, productType, number);
            });

            coordinates = additionalOrder.coordinates;
        });

        turns = deliveryPlan.turnsLeft;


        console.log(
            'drone: ' + deliveryPlan.drone.id + ' - turns left: ' + turns
            + 'elivering order: '
            + deliveryPlan.order.id + ' with '
            + Object.keys(deliveryPlan.products).length
            + ' products - remaining products: ' + deliveryPlan.order.products.length
            + ' - weight: ' + Helper.getProductsWeight(config, deliveryPlan.products)
            + ' to coordinates ' + deliveryPlan.order.coordinates
        );
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
    }
};
