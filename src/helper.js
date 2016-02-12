var fs = require('node-fs');
var _ = require('underscore');
var Helper = require('./helper');

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

module.exports.findRandomNotFinishedOrder = function(config) {
    var randomIndex = Math.floor((Math.random() * Object.keys(config.orders).length));

    return config.orders[randomIndex];
};

module.exports.findSmallestOrderNotFinishedOrder = function(config) {
    var smallestSize = Number.MAX_VALUE;
    var smallestOrder = null;

    _.each(config.orders, function(order) {
        if (!order.isComplete && order.products.length < smallestSize) {
            smallestOrder = order;
        }
    });

    return smallestOrder;
};

module.exports.getNextDeliveryPlan = function(config, order) {
    var smallestDistance = Number.MAX_VALUE;
    var deliveryPlan = {
        warehouse: null,
        products: [],
        order: order
    };

    var weight = 0;

    while (order.products.length > 0) {
        var currentProductWeight = config.productWeights[order.products[0]];

        if (weight + currentProductWeight <= config.payload) {
            weight += currentProductWeight;
            deliveryPlan.products.push(order.products.shift());
        } else {
            break;
        }
    };

    deliveryPlan.products = Helper.productArrayToObject(deliveryPlan.products);

    if (order.products.length == 0) {
        order.isComplete = true;
    }

    config.drones.forEach(function(drone) {
        config.warehouses.forEach(function(warehouse) {
            if (!warehouse.hasProductsInStock(deliveryPlan.products)) {
                return;
            }

            if (drone.id == 1) {
                console.log(drone.id, drone.getCoordinates());
            } else {
                console.log('other drone');
            }



            var warehouseDroneDistance = distance(warehouse.coordinates, drone.getCoordinates());
            var warehouseOrderDistance = distance(warehouse.coordinates, order.coordinates);
            var totalDinstance = warehouseDroneDistance + warehouseOrderDistance;

            var neededTurns = totalDinstance + 2 * Object.keys(deliveryPlan.products).length;

            if (neededTurns > drone.getTurns()) {
                return
            }

            if (totalDinstance < smallestDistance) {

                smallestDistance = totalDinstance;
                deliveryPlan.drone = drone;
                deliveryPlan.warehouse = warehouse;
            }
        });
    });

    deliveryPlan.dinstance = smallestDistance;

    return deliveryPlan;
};

module.exports.productArrayToObject = function(productArray) {
    obj = {};

    productArray.forEach(function(product) {
        if (!obj[product]) {
            obj[product] = 0;
        }

        obj[product]++;
    });

    return obj;
};

module.exports.distance = distance;

function distance(coordinates1, coordinates2) {
    return Math.ceil(Math.sqrt(
        Math.pow(Math.abs(coordinates1[0] - coordinates2[0]), 2) +
        Math.pow(Math.abs(coordinates1[1] - coordinates2[1]), 2)
    ));
}

