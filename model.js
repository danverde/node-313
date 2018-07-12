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
    var passwordHash = null;
    var userId = null;

    if (email === 'bleh@gmail.com') {
        passwordHash = '$2a$10$kpAxG/axNjzmkQ6tYJLLQOct8qBzvg.G6lIh6QQuM8m5HPYrRX/G.';
        userId = 1;
    }

    cb(null, passwordHash, userId);
}

function registerUser(credentials, cb) {

    cb(null);
}

function getBuildById(id, cb) {
    var build;
    if (id == 1) {
        build = build1;
    } else {
        build = build2;
    }

    cb(null, build);
}

function getItemsByType(typeId, cb) {
    var items,
        itemTypeName;
    if (typeId == 1) {
        itemTypeName = 'Motherboards';
        items = motherboards;
    } else {
        itemTypeName = 'RAM';
        items = ram;
    }

    cb(null, items, itemTypeName);
}

function removeItemFromBuild(buildId, itemId, cb) {
    if (buildId == 1) {
        build1 = build1.filter(item => item.itemId != itemId);
        cb(null, build1);
        console.log('\n', build1);
    } else {
        build2 = build2.filter(item => item.itemId != itemId);
        cb(null, build2);
        console.log('\n', build2);
    }

    
}

module.exports = {
    getItemTypes,
    getLoginCredentials,
    registerUser,
    getBuildById,
    getItemsByType,
    removeItemFromBuild,
};


/* HARD-CODED values for testing */
/* Eventually these will be replaced by the DB... */

var build1 = [{
    itemTypeId: 1,
    itemTypeName: 'Motherboard',
    itemId: 1,
    itemName: 'Z97-AR.jpg',
    itemPrice: 100
}, {
    itemTypeId: 2,
    itemTypeName: 'RAM',
    itemId: 3,
    itemName: 'Tridentz RGB',
    itemPrice: 100
}];

var build2 = [{
    itemTypeId: 1,
    itemTypeName: 'Motherboard',
    itemId: 2,
    itemName: 'x299e',
    itemPrice: 30
}, {
    itemTypeId: 2,
    itemTypeName: 'RAM',
    itemId: 4,
    itemName: 'Corsair Vengance',
    itemPrice: 30
}];

var motherboards = [{
    itemId: 1,
    itemName: 'Z97-AR.jpg',
    itemPrice: 100,
    itemDescription: 'This is a really cool item that you shoud get',
    itemImagePath: '/images/z97ar.jpg',
}, {
    itemId: 2,
    itemName: 'x299e',
    itemPrice: 30,
    itemDescription: 'This is a really cool item that you shoud get',
    itemImagePath: '/images/x299e.jpg',
}];

var ram = [{
    itemId: 3,
    itemName: 'Tridentz RGB',
    itemPrice: 100,
    itemDescription: 'This is a really cool item that you shoud get',
    itemImagePath: '/images/tridentz.jpg',
}, {
    itemId: 4,
    itemName: 'Corsair Vengance',
    itemPrice: 30,
    itemDescription: 'This is a really cool item that you shoud get',
    itemImagePath: '/images/vengance.jpg',
}];