var _ = require('underscore');
var Helper = require('./helper');

module.exports = function(id, config) {
    var turns = config.turns;
    var coordinates = config.warehouses[0].coordinates;

    function loadItems(warehouse, productType, number) {
        config.commands.push(id + ' L ' + warehouse.id + ' ' + productType + ' ' + number);
        warehouse.products[productType] -= number;
        turns--;
    }

    function deliverOrder(deliveryPlan) {
        _.each(deliveryPlan.products, function(number, productType) {
            loadItems(deliveryPlan.warehouse, productType, number);
        });

        turns -= deliveryPlan.dinstance;

        _.each(deliveryPlan.products, function(number, productType) {
            deliverItem(deliveryPlan, productType, number);
        });

        console.log('delivering order ' + deliveryPlan.order.id + ' to ' + deliveryPlan.order.coordinates);

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
        deliverOrder: deliverOrder,
        getTurns: getTurns
    }
};
