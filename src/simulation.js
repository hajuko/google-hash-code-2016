module.exports.run = function(fileName) {
    var parser = require('./parser');
    var Drone = require('./drone');
    var _ = require('underscore');
    var fs = require('node-fs');

    var config = parser.import('./data/' + fileName + '.in');
    var drones = [];
    config.commands = [];

    config.orders = {};

    config.ordersArray.forEach(function(order, orderId) {
        order.id = orderId;
        config.orders[orderId] = order;
    });

    createDrones(config.drones);

    //sortOrdersByItems();






    //while (config.orders > 0) {
    //
    //    while (drones.length > 0) {
    var drone = drones.shift();
    //
    var order = findSmallestOrder();

    console.log(order);


    while (order.products.length > 0) {
        if (drone.canLoad(order.products[0], 1)) {
            drone.loadItems(0, order.products.shift(), 1);
        } else {
            break;
        }
    };
    //    }
    //}

    drone.deliverOrder(order.id, order.coordinates);


    console.log(config.commands);


    writeCommands();


    function writeCommands() {
        var content = config.commands.length + '\n';

        config.commands.forEach(function(command, i) {
            content += command;

            if (i !== config.commands.length - 1) {
                content += '\n';
            }
        });

        fs.writeFileSync('./data/' + fileName + '.out', content, 'utf8');
    }

    function findSmallestOrder() {
        var smallestSize = Number.MAX_VALUE;
        var smallestOrder = null;

        _.each(config.orders, function(order) {
            if (!order.isComplete && order.products.length < smallestSize) {
                smallestOrder = order;
            }
        });

        return smallestOrder;
    }


    function findNearestWareHouse(coordinates) {
        var nearestWareHouse = null;
        var closestDistance = Number.MAX_VALUE;;
        config.warehouses.forEach(function(warehouse) {
            var currentDistance = distance(warehouse.coordinates, coordinates);

            if (currentDistance < closestDistance) {
                closestDistance = currentDistance;
                nearestWareHouse = warehouse;
            }
        });

        return nearestWareHouse;
    }

    function createDrones(num) {
        for (var i = 0; i < num; i++) {
            drones.push(new Drone(i, config));
        }
    }

    function distance(coordinates1, coordinates2) {
        return Math.sqrt(
            Math.pow(Math.abs(coordinates1[0] - coordinates2[0]), 2) +
            Math.pow(Math.abs(coordinates1[1] - coordinates2[1]), 2)
        );
    }


    function sortOrdersByItems() {
        config.orders.sort(function(a, b) {
            return a.products.length - b.products.length;
        });
    }
}
