module.exports = function(fileName) {
    var parser = require('./parser');
    var Helper = require('./helper');
    var config = parser.import('./data/' + fileName + '.in');
    var order;
    var lowLoadCount = 0;

    while (order = Helper.findSmallestNotFinishedOrder(config)) {
        var deliveryPlan = Helper.getNextDeliveryPlan(config, order);

        var loadFactor = deliveryPlan.weight / config.payload;

        if (loadFactor < 0.5) {
            lowLoadCount++;
            console.log('load factor: ' + loadFactor);
        }

        console.log('getting new order: '
            + order.id + ' with '
            + Object.keys(deliveryPlan.products).length
            + ' products - remaining products: ' + order.products.length
            + ' - weight: ' + Helper.getProductsWeight(config, deliveryPlan.products));

        if (!deliveryPlan.warehouse) {
            // TODO Improvement finden.
            order.isComplete = true;
            continue;
        }

        deliveryPlan.drone.deliverOrders(deliveryPlan);
    }

    console.log(lowLoadCount);
    Helper.writeCommands(config.commands, fileName);
};
