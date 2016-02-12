module.exports = function(productTypes) {

    function getNumberOfType(type) {
        return productTypes[type].count;
    }

    function addItems(type, count) {
        productTypes[type].count += count;
    }

    function removeItems(type, count) {
        productTypes[type].count -= count;
    }

    return {
        getNumberOfType: getNumberOfType,
        addItems: addItems,
        removeItems: removeItems
    }
};
