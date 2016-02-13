var fs = require('node-fs');
var Warehouse = require('./warehouse');
var Order = require('./order');
var Drone = require('./drone');


module.exports.import = function(file) {
    var lines;
    var config = {
        productWeights: [],
        warehouses: [],
        orders: {},
        commands: [],
        drones: []
    };
    var inputSet = fs.readFileSync(file, 'utf8');
    var currentWarehouse = null;
    var currentOrder;
    var orderId = 0;
    var orderCount = 0;
    var warehouseId = 0;

    lines = inputSet.split('\n');

    for (var i = 0; i < lines.length; i++ ) {
        var line = lines[i].split(' ');

        if (i == 0) {
            config.rows = line[0];
            config.columns = line[1];
            config.droneNumber = line[2];
            config.turns = parseInt(line[3]);
            config.payload = parseInt(line[4]);
        }

        if (i == 2) {
            line.forEach(function(weight, productType) {
                config.productWeights[productType] = parseInt(weight);
            });
        }

        if (i == 3) {
            config.numberOfWarehouses = line[0];
        }

        if (i >= 4 && i < config.numberOfWarehouses * 2 + 4) {
            if (i % 2 == 0) {
                currentWarehouse = new Warehouse();
                currentWarehouse.coordinates = line;
                currentWarehouse.id = warehouseId;
                warehouseId++;
            } else {
                line.forEach(function(productCount, productType) {
                    currentWarehouse.products[productType] = productCount;
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
                currentOrder.products = sortByProductWeight(line, config);
                currentOrder.id = orderId;
                config.orders[orderId] = currentOrder;
                orderId++;
            }

            orderCount++;
        }
    };

    createDrones(config.droneNumber, config);

    return config;
};

function sortByProductWeight(productTypes, config) {
    return productTypes.sort(function (a, b) {
        return config.productWeights[a] - config.productWeights[b];
    });
}

function createDrones(num, config) {
    for (var i = 0; i < num; i++) {
        config.drones.push(new Drone(i, config));
    }
}
