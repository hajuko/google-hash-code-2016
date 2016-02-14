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

module.exports.findNearestWareHouse = function(coordinates, warehouses) {
    var nearestWareHouse = null;
    var closestDistance = Number.MAX_VALUE;

    warehouses.forEach(function(warehouse) {
        var currentDistance = distance(warehouse.coordinates, coordinates);

        if (currentDistance < closestDistance) {
            closestDistance = currentDistance;
            nearestWareHouse = warehouse;
        }
    });

    return nearestWareHouse;
};

module.exports.findSmallestNotFinishedOrder = function(config) {
    var smallestSize = Number.MAX_VALUE;
    var smallestOrder = null;

    _.each(config.orders, function(order) {
        if (!order.isComplete && order.products.length < smallestSize) {
            smallestOrder = order;
            smallestSize = order.products.length;
        }
    });

    return smallestOrder;
};

module.exports.getNextDeliveryPlan = function(config, order) {
    var clonedOrder = _.clone(order);
    var smallestDistance = Number.MAX_VALUE;
    var bestScore = Number.MAX_VALUE;
    var deliveryPlan = {
        warehouse: null,
        products: [],
        order: null,
        weight: null,
        additionalOrders: []
    };

    var weight = 0;

    // TODO: Hier könnte man alle knapsackproblem die beste combo finden die rein passt. statt nach gewicht zu sortieren.
    while (clonedOrder.products.length > 0) {
        var nextProductId = clonedOrder.products[0];
        var currentProductWeight = Helper.getProductWeight(config, nextProductId);

        if (weight + currentProductWeight <= config.payload) {
            weight += currentProductWeight;
            deliveryPlan.products.push(clonedOrder.products.shift());
        } else {
            break;
        }
    };

    deliveryPlan.products = Helper.productArrayToObject(deliveryPlan.products);

    if (clonedOrder.products.length == 0) {
        console.log('set is complete');
        clonedOrder.isComplete = true;
    }

    config.drones.forEach(function(drone) {
        config.warehouses.forEach(function(warehouse) {
            if (!warehouse.hasProductsInStock(deliveryPlan.products)) {
                return;
            }

            var warehouseDroneDistance = distance(warehouse.coordinates, drone.getCoordinates());
            var warehouseOrderDistance = distance(warehouse.coordinates, clonedOrder.coordinates);
            var totalDistance = warehouseDroneDistance + warehouseOrderDistance;
            var neededTurns = totalDistance + 2 * Object.keys(deliveryPlan.products).length;

            if (neededTurns > drone.getTurns()) {
                return;
            }

            var score = Helper.calculateDistanceWithScore(config, drone, totalDistance);

            if (score <= bestScore) {

                bestScore = score;
                smallestDistance = totalDistance;
                deliveryPlan.drone = drone;
                deliveryPlan.warehouse = warehouse;
                deliveryPlan.turnsLeft = drone.getTurns() - neededTurns;
            }
        });
    });

    // TODO: Solange nicht behandelt skippen.
    if (!deliveryPlan.warehouse) {
        console.log('no warehouse');

        return deliveryPlan;
    }

    order = clonedOrder;
    deliveryPlan.order = order;

    deliveryPlan.warehouse.removeProducts(deliveryPlan.products);
    deliveryPlan.weight = weight;
    deliveryPlan.distance = smallestDistance;

    var loadFactor = weight / config.payload;

        Helper.addNearestCompletableOrder(config, deliveryPlan);

        if (deliveryPlan.additionalOrders.length == 0) {
            console.log('nothing found!!!!!');
        }

    return deliveryPlan;
};

module.exports.addNearestCompletableOrder = function(config, deliveryPlan) {
    var smallestDistance = Number.MAX_VALUE;
    var bestOrder = null;
    var currentProducts = {};
    var remainingWeight = config.payload - deliveryPlan.weight;
    var currentNeedTurns = null;
    var currentOrderWeight = null;

    _.each(config.orders, function(order) {
        if (order.isComplete) {
            return;
        }

        var productObj = Helper.productArrayToObject(order.products);

        if (!deliveryPlan.warehouse.hasProductsInStock(productObj)) {
            return;
        }

        var orderWeight = Helper.getProductsWeight(config, productObj);

        if (orderWeight > remainingWeight) {
            return;
        }

        var orderToOrderDistance = distance(deliveryPlan.order.coordinates, order.coordinates);
        var neededTurns = orderToOrderDistance + 2 * Object.keys(productObj).length;


        if (neededTurns > deliveryPlan.turnsLeft) {
            return;
        }

        if (orderToOrderDistance < smallestDistance) {
            smallestDistance = orderToOrderDistance;
            currentNeedTurns = neededTurns;
            bestOrder = order;
            currentProducts = productObj;
            currentOrderWeight = orderWeight;
        }
    });

    if (bestOrder) {
        deliveryPlan.turnsLeft -= currentNeedTurns;
        deliveryPlan.warehouse.removeProducts(currentProducts);
        deliveryPlan.additionalOrders.push(bestOrder);
        bestOrder.isComplete = true;
        deliveryPlan.weight += currentOrderWeight;
    } else {
        return false;
    }
};

module.exports.deliverSplitOrders = function(config) {
    _.each(config.splitOrders, function(splitOrder) {
        Helper.findWarehouseCombo(config, splitOrder);
    });
};

module.exports.findWarehouseCombo = function(config, order) {
    var clonedOrder = _.clone(order);

    var splitCombos = {
        warehousesProducts: [],
        order: order,
        completeProducts: []
    };

    while (true) {
        var bestWarehouse = null;
        var availableProducts = null;
        var hightestNumberOfItemsInStock = 0;

        config.warehouses.forEach(function(warehouse) {
            var carriableItemsInStock = warehouse.getCarriableItemsInStock(config, clonedOrder.products);

            if (carriableItemsInStock.length > hightestNumberOfItemsInStock) {
                hightestNumberOfItemsInStock = carriableItemsInStock.length;
                bestWarehouse = warehouse;
                availableProducts = carriableItemsInStock;
            }
        });

        if (bestWarehouse == null) {
            console.warn('NO WAREHOUSE FOUND');
            return;
        }

        availableProducts.forEach(function(product) {
            splitCombos.completeProducts.push(product);
        });

        splitCombos.warehousesProducts.push({
            warehouse: bestWarehouse,
            products: availableProducts
        });

        splitCombos.completeProducts.sort(function(a, b) {
            return a - b;
        });

        clonedOrder.products = Helper.remaining(clonedOrder.products, splitCombos.completeProducts);

        if (clonedOrder.products.length == 0) {
            order.isComplete = true;
            console.log('yeah');
            break;
        }
    }

    Helper.executeSplit(config, splitCombos);
};


module.exports.executeSplit = function(config, splitCombos) {
    var warehousesProducts = splitCombos.warehousesProducts;

    warehousesProducts.forEach(function(warehouseProductPair) {
        var deliveryPlan = {
            products: Helper.productArrayToObject(warehouseProductPair.products),
            warehouse: warehouseProductPair.warehouse,
            order: splitCombos.order,
            additionalOrders: []
        };

        deliveryPlan.warehouse.removeProducts(deliveryPlan.products);

        var drone = Helper.findNearestDrone(config, deliveryPlan);

        if (drone === null) {
            console.warn('DRONE NOT FOUND');
            return;
        }

        drone.deliverOrders(deliveryPlan);
    });
}

module.exports.findNearestDrone = function(config, deliveryPlan) {
    var bestDrone = null;
    var smallestDistance = Number.MAX_VALUE;
    var neededTurns = null;
    var warehouseOrderDistance = distance(deliveryPlan.warehouse.coordinates, deliveryPlan.order.coordinates);
    var loadAndDeliveryTurns = 2 * Object.keys(deliveryPlan.products).length;

    config.drones.forEach(function(drone) {
        var droneWarehouseDistance = distance(drone.getCoordinates(), deliveryPlan.warehouse.coordinates);
        neededTurns = droneWarehouseDistance + warehouseOrderDistance + loadAndDeliveryTurns;

        var productWeight = Helper.getProductsWeight(config, deliveryPlan.products);

        if (productWeight > config.payload) {
            console.log(productWeight);
            console.log('TOOOO MUCH WEIGHT');
            return;
        }

        if (drone.getTurns() < neededTurns) {
            return;
        }

        if (droneWarehouseDistance < smallestDistance) {
            smallestDistance = droneWarehouseDistance;
            bestDrone = drone;
        }
    });

    if (bestDrone == null) {
        console.log('no drone found');
        return null;
    }

    deliveryPlan.turnsLeft = bestDrone.getTurns() - neededTurns;

    return bestDrone;
};

module.exports.findBestDrone = function(config) {
    var bestDrone = null;
    var turns = 0;

    config.drones.forEach(function(drone) {
        if (drone.getTurns() > turns) {
            turns = drone.getTurns();
            bestDrone = drone;
        }
    });

    return bestDrone;
}

module.exports.productArrayToObject = function(productArray) {
    var obj = {};

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

module.exports.getProductWeight = function(config, productId) {
    return config.productWeights[productId];
};

module.exports.getProductsWeight = function(config, products) {
    var weight = 0;
    _.each(products, function(number, productId) {
        var productWeight = Helper.getProductWeight(config, productId);

        weight += productWeight * parseInt(number);
    });

    return weight;
};

module.exports.getNotFinishedOrders = function(config) {
    var notCompletedOrders = [];
    _.each(config.orders, function(order) {
        if (!order.isComplete) {
            notCompletedOrders.push(order);
        }
    });

    return notCompletedOrders;
};

module.exports.calculateDistanceWithScore = function(config, drone, distance) {
    var turnScore = Math.pow((1- ((drone.getTurns() / config.turns))) + 1, 10);

    return distance * turnScore;
};

module.exports.remaining = function(array1, array2) {
    var result = _.clone(array1);

    array2.forEach(function(value) {
        var index = result.indexOf(value);

        if (index > -1) {
            result.splice(index, 1);
        }
    });

    return result;
};

