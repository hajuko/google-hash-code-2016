var fs = require('node-fs');
var _ = require('underscore');

module.exports.writeCommands = function(commands, fileName) {
    var content = commands.length + '\n';

    commands.forEach(function(command, i) {
        content += command;

        if (i !== commands.length - 1) {
            content += '\n';
        }
    });

    fs.writeFileSync('./data/' + fileName + '.out', content, 'utf8');
};


module.exports.findNearestWareHouse = function(config, coordinates) {
    var nearestWareHouse = null;
    var closestDistance = Number.MAX_VALUE;

    config.warehouses.forEach(function(warehouse) {
        var currentDistance = distance(warehouse.coordinates, coordinates);

        if (currentDistance < closestDistance) {
            closestDistance = currentDistance;
            nearestWareHouse = warehouse;
        }
    });

    return nearestWareHouse;
};

module.exports.findSmallestOrder = function(config) {
    var smallestSize = Number.MAX_VALUE;
    var smallestOrder = null;

    _.each(config.orders, function(order) {
        if (!order.isComplete && order.products.length < smallestSize) {
            smallestOrder = order;
        }
    });

    return smallestOrder;
};


function distance(coordinates1, coordinates2) {
    return Math.sqrt(
        Math.pow(Math.abs(coordinates1[0] - coordinates2[0]), 2) +
        Math.pow(Math.abs(coordinates1[1] - coordinates2[1]), 2)
    );
}
