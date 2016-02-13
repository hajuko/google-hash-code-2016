var Helper = require('../src/helper');
jasmine.getEnv().addReporter(new jasmine.ConsoleReporter(console.log));

describe("The Distance Calculation", function() {
    it("should calculate the correct distance for same coordinates", function() {
        var coord1 = [0, 0];
        var coord2 = [0, 0];
        expect(Helper.distance(coord1, coord1)).toBe(0);
        expect(Helper.distance(coord1, coord2)).toBe(0);
    });

    it("should calculate the correct distance for coordinates in the same row or column", function() {
        var coord1 = [0, 0];
        var coord2 = [0, 1];
        var coord3 = [2, 0];
        expect(Helper.distance(coord1, coord2)).toBe(1);
        expect(Helper.distance(coord1, coord3)).toBe(2);
    });

    it("should calculate the correct distance coordinates in different rows and columns", function() {
        var coord1 = [1, 1];
        var coord2 = [2, 2];
        var coord3 = [3, 2];
        expect(Helper.distance(coord1, coord2)).toBe(2);
        expect(Helper.distance(coord1, coord3)).toBe(3);
    });
});


describe("The Array to Object function", function() {
    it("should  generate the correct object", function() {
        var productArray = [0, 1, 5, 3, 3, 0];
        var expectedResult = {
            0: 2,
            1: 1,
            3: 2,
            5: 1
        };

        expect(Helper.productArrayToObject(productArray)).toEqual(expectedResult);
    });
});

describe("The findSmallestNotFinishedOrder function", function() {

    var config = {
        orders: {
            0: {
                isComplete: true,
                products: [3, 2],
                id: 0
            },
            1: {
                isComplete: false,
                products: [4, 1, 3, 1],
                id: 1
            },
            2: {
                isComplete: false,
                products: [2, 4],
                id: 2
            },
            3: {
                isComplete: false,
                products: [5, 2 , 1, 1],
                id: 3
            },
            4: {
                isComplete: false,
                products: [7, 1, 3],
                id: 4
            }
        }
    };

    it("should find the smallest order that is not finished", function() {
        expect(Helper.findSmallestNotFinishedOrder(config)).toEqual(config.orders[2]);
    });
});


describe("The orderweight caluculation", function() {

    it("should calculate the weight correctly", function() {
        var config = {
            productWeights: {
                0: 50,
                1: 10,
                3: 100
            }
        };

        var products = {
            0: 2,
            1: 1,
            3: 5
        };

        expect(Helper.getProductsWeight(config, products)).toBe(610);
    });
});
