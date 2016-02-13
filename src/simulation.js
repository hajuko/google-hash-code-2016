module.exports = function(fileName) {
    var parser = require('./parser');
    var Helper = require('./helper');
    var config = parser.import('./data/' + fileName + '.in');

    while (true) {
        var order = Helper.findNearestOrderDoableInOneLoadMOTHER(config);

        if (!order) {
            order = Helper.findSmallestNotFinishedOrder(config);
        }

        if (!order) {
            break;
        }

        var deliveryPlan = Helper.getNextDeliveryPlan(config, order);

        if (!deliveryPlan.warehouse) {
            // TODO Improvement finden.
            order.isComplete = true;
            continue;
        }

        deliveryPlan.drone.deliverOrders(deliveryPlan);
    }

    console.log(config.orders);

    Helper.writeCommands(config.commands, fileName);
};
