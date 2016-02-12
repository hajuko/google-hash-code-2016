module.exports = function(fileName) {
    var parser = require('./parser');
    var Helper = require('./helper');
    var _ = require('underscore');
    var fs = require('node-fs');
    var config = parser.import('./data/' + fileName + '.in');

    var order;

    while (order = Helper.findSmallestOrderNotFinishedOrder(config)) {
        var deliveryPlan = Helper.getNextDeliveryPlan(config, order);

        if (!deliveryPlan.warehouse) {
            console.log('warehouse not found');
            order.isComplete = true;
            continue;
        }

        console.log(order.id);


        deliveryPlan.drone.deliverOrder(deliveryPlan);
    }

    Helper.writeCommands(config.commands, fileName);
};
