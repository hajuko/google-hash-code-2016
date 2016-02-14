var _ = require('underscore');
var StockController = require('./stockController');

module.exports = function(fileName) {
    var parser = require('./parser');
    var Helper = require('./helper');
    var config = parser.import('./data/' + fileName + '.in');
    var order;
    config.splitOrders = {};
    var stockController = new StockController(config);
    stockController.matchOrdersWithWarehouses();
    stockController.createWarehouseInfos();
    stockController.createAllProductDeliveres();

    console.log(config.stockDeliveries);
    console.log(config.warehouses[0].getTotalMissingProducts());
    process.exit();

    while (order = Helper.findSmallestNotFinishedOrder(config)) {
        var deliveryPlan = Helper.getNextDeliveryPlan(config, order);

        if (!deliveryPlan.warehouse) {
            var clonedOrder = _.clone(order);
            config.splitOrders[clonedOrder.id] = clonedOrder;
            order.isComplete = true;
            continue;
        }

        deliveryPlan.drone.deliverOrders(deliveryPlan);
    }
    //Helper.deliverSplitOrders(config);
    Helper.writeCommands(config.commands, fileName);
};
