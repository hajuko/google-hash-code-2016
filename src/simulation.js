module.exports = function(fileName) {
    var parser = require('./parser');
    var Helper = require('./helper');
    var _ = require('underscore');
    var fs = require('node-fs');
    var config = parser.import('./data/' + fileName + '.in');
    var drone = config.drones.shift();
    var order = Helper.findSmallestOrder(config);

    while (order.products.length > 0) {
        if (drone.canLoad(order.products[0], 1)) {
            drone.loadItems(0, order.products.shift(), 1);
        } else {
            break;
        }
    };

    drone.deliverOrder(order.id, order.coordinates);
    Helper.writeCommands(config.commands, fileName);
};
