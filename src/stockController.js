var _ = require('underscore');
var Helper = require('./helper');

module.exports = function(config) {

    function matchOrdersWithWarehouses() {
        _.each(config.orders, function(order) {
            var smallestDistance = Number.MAX_VALUE;
            var nearestWarehouse = null;

            config.warehouses.forEach(function(warehouse) {
                var orderWarehouseDistance = Helper.distance(order.coordinates, warehouse.coordinates);

                if (orderWarehouseDistance < smallestDistance) {
                    smallestDistance = orderWarehouseDistance;
                    nearestWarehouse = warehouse;
                }
            });

            nearestWarehouse.addOrder(order);
        });
    }

    function createWarehouseInfos() {
        config.warehouses.forEach(function(warehouse) {

            config.productWeights.forEach(function(weight, productId) {
                if (!warehouse.productInfos[productId]) {
                    warehouse.productInfos[productId] = {
                        stock: warehouse.products[productId],
                        needed: 0,
                        productWeight: weight
                    };
                }
            });

            warehouse.orders.forEach(function(order) {
                order.products.forEach(function(productId) {
                    warehouse.productInfos[productId].needed++;
                });
            });
        });
    }

    function createAllProductDeliveres() {
        config.warehouses.forEach(function(warehouse) {
            _.each(warehouse.getMissingProducts(), function(numberOfMissingProducts, productId) {
               createProductDeliveriesForWarehouseAndType(warehouse, productId);
            });
        });
    }


    function createProductDeliveriesForWarehouseAndType(warehouse, productId) {
        var numberOfMissingItems = warehouse.getAmoutOfMissingProduct(productId);
        var productWeight = warehouse.getProductWeight(productId);

        while(numberOfMissingItems > 0) {
            var currentWeight = 0;
            var numberOfItems = 0;

            while (numberOfItems < numberOfMissingItems) {
                if (currentWeight + productWeight > config.payload) {
                    break;
                }

                var warehouses = findWarehouseWithProductOverflow(productId, numberOfItems + 1);

                if (warehouses.length === 0) {
                    break;
                }

                numberOfItems++;
            }

            numberOfMissingItems -= numberOfItems;

            var availableWarehouses = findWarehouseWithProductOverflow(productId, numberOfItems);
            var nearestWarehouse = Helper.findNearestWareHouse(warehouse.coordinates, availableWarehouses);
            var stockDelivery = {
                havingWarehouse: nearestWarehouse,
                needingWarehouse: warehouse,
                productsToDeliver: {}
            };
            stockDelivery.productsToDeliver[productId] = numberOfItems;
            config.stockDeliveries.push(stockDelivery);
        }
    }

    function findWarehouseWithProductOverflow(productId, number) {
        var warehouses = [];

        config.warehouses.forEach(function(warehouse) {
            if (warehouse.getAmoutOfOverflowProduct(productId) >= number) {
                warehouses.push(warehouse);
            }
        });

        return warehouses;
    }

    this.createWarehouseInfos = createWarehouseInfos;
    this.matchOrdersWithWarehouses = matchOrdersWithWarehouses;
    this.createAllProductDeliveres = createAllProductDeliveres;
};