const {
    Pool
} = require('pg');
const connectionString = process.env.DATABASE_URL; // TODO get this working! || 'postgres://ta_user:ta_pass@localhost:5432/familyhistory';
const pool = new Pool({
    connectionString: connectionString
});


function getItemTypes(cb) {
    var itemTypes = [{
        itemTypeName: 'Motherboards',
        itemTypeId: 1
    }, {
        itemTypeName: 'RAM',
        itemTypeId: 2
    }];

    cb(null, itemTypes);
}

function getLoginCredentials(email, cb) {
    var passwordHash = '';
    cb(null, passwordHash);
}

function registerUser(credentials, cb) {

    cb(null);
}

function getBuildById(id, cb) {

    var build = [{
        itemTypeId: 1,
        itemTypeName: 'Motherboard',
        itemId: 7,
        itemName: 'Cheapie MB',
        itemPrice: 25
    }, {
        itemTypeId: 2,
        itemTypeName: 'RAM',
        itemId: 18,
        itemName: 'Cheapie RAM',
        itemPrice: 3
    }];

    cb(null, build);
}

function getItemsByType(typeId, cb) {
    var items = [{
        itemId: 1,
        itemName: 'Z97-AR.jpg',
        itemPrice: 100,
        itemDescription: 'This is really cool item that you shoud get',
        itemImagePath: '/images/z97ar.jpg',
        isActive: true
    }, {
        itemId: 2,
        itemName: 'x299e',
        itemPrice: 30,
        itemDescription: 'This is really cool item that you shoud get',
        itemImagePath: '/images/x299e.jpg',
        isActive: false
    }];

    var itemTypeName = 'Motherboards';

    cb(null, items, itemTypeName);
}

module.exports = {
    getItemTypes,
    getLoginCredentials,
    registerUser,
    getBuildById,
    getItemsByType,
};