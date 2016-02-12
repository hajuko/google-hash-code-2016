var fs = require('node-fs');
var Warehouse = require('./warehouse');
var Order = require('./order');
var Drone = require('./drone');
var lines;

var config = {
    productWeights: [],
    warehouses: [],
    orders: {},
    commands: [],
    drones: []
};



module.exports.import = function(file) {
    var inputSet = fs.readFileSync(file, 'utf8');

    lines = inputSet.split('\n');

    var currentWarehouse;
    var currentOrder;
    var orderCount = 0;
    var ordersArray = [];

    for (var i = 0; i < lines.length; i++ ) {

        var line = lines[i].split(' ');
        if (i == 0) {
            config.rows = line[0];
            config.columns = line[1];
            config.droneNumber = line[2];
            config.turns = line[3];
            config.payload = line[4];
        }

        if (i == 2) {
            line.forEach(function(weight, j) {
                config.productWeights[j] = weight;
            });
        }

        if (i == 3) {
            config.numberOfWarehouses = line[0];
        }

        if (i >= 4 && i < config.numberOfWarehouses * 2 + 4) {
            if (i % 2 == 0) {
                currentWarehouse = new Warehouse();
                currentWarehouse.coordinates = line;

            } else {
                line.forEach(function(productCount, productId) {
                    currentWarehouse.products[productId] = productCount;
                });
                config.warehouses.push(currentWarehouse);
            }
        }

        if (i > config.numberOfWarehouses * 2 + 4) {

            if (orderCount % 3 == 0) {
                currentOrder = new Order();
                currentOrder.coordinates = line;
            }

            if (orderCount % 3 == 2) {
                ordersArray.push(currentOrder);
                currentOrder.products = sortByProductWeight(line);
            }

            orderCount++;
        }
    };

    ordersArray.forEach(function(order, orderId) {
        order.id = orderId;
        config.orders[orderId] = order;
    });

    config.drones = createDrones(config.droneNumber);

    return config;
};

function sortByProductWeight(productTypes) {
    return productTypes.sort(function (a, b) {
        return config.productWeights[a] - config.productWeights[b];
    });
}

function createDrones(num) {
    var drones = [];

    for (var i = 0; i < num; i++) {
        drones.push(new Drone(i, config));
    }

    return drones;
}
