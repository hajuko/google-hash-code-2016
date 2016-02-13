module.exports = function(fileName) {
    var parser = require('./parser');
    var Helper = require('./helper');
    var config = parser.import('./data/' + fileName + '.in');

    var order;


    while (order = Helper.findSmallestNotFinishedOrder(config)) {
        var deliveryPlan = Helper.getNextDeliveryPlan(config, order);


        console.log('getting new order: ' + order.id + ' with ' + Object.keys(deliveryPlan.products).length + ' products - remaining products: ' + order.products.length);;
        console.log('_________________________________' + order.id);

        if (!deliveryPlan.warehouse) {
            console.log('warehouse not found');
            // TODO Improvement finden.
            order.isComplete = true;
            continue;
        }

        deliveryPlan.drone.deliverOrder(deliveryPlan);

    }

    Helper.writeCommands(config.commands, fileName);

};
