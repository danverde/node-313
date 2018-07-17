/* eslint no-console:0 */

const asyncLib = require('async');
const _ = require('lodash');
const {
    Pool
} = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://nodeuser:admin@localhost:5432/builds';
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

function getUserByEmail(email, cb) {
    pool.query('SELECT * FROM users WHERE email=$1', [email], (err, result) => {
        if (err) {
            cb(err);
            return;
        }

        var user = null;
        if (result.rowCount > 0) {
            user = result.rows[0];
        }

        cb(null, user);
    });
}

function createUser(userData, cb) {
    // var userId = 1,
    //     buildId = 1;

    var params = [
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password
    ];

    // TODO check for user before attempting to add!
    pool.query('INSERT INTO users(firstName, lastName, email, password) VALUES($1, $2, $3, $4) RETURNING userId',
        params, (err, addUserResult) => {
            if (err) {
                cb(err, null, null);
                return;
            }

            var userId = addUserResult.rows[0].userid;

            pool.query('INSERT INTO builds (userId) VALUES($1) RETURNING buildId', [userId], (err, addBuildResult) => {
                if (err) {
                    cb(err, userId, null);
                    return;
                }

                var buildId = addBuildResult.rows.buildid;
                cb(null, userId, buildId);
            });
        });
}

function getItemById(item, cb) {
    // console.log(item);
    var key = item[0];
    var itemId = item[1];

    pool.query('SELECT * FROM items WHERE itemId=$1', [itemId], (err, itemDetails) => {
        if (err) {
            cb(err, null);
            return;
        }
        console.log(itemDetails.rows);
        cb(itemDetails.rows);
    });
}

function getBuildById(buildId, cb) {
    // var build;
    pool.query('SELECT * FROM builds WHERE buildId=$1;', [buildId], (err, build) => {
        if (err) {
            cb(err, null);
            return;
        }
        // console.log(build.rows);
        asyncLib.map(_.entries(build.rows[0]), getItemById, (err, detailedBuild) => {
            if (err) {
                console.error(err);
            }
            console.log(detailedBuild);
            cb(null, detailedBuild);
        });

        // getItemsInBuild(build.rows, cb);
    });
    // TESTING
    // if (id == 1) {
    //     build = build1;
    // } else {
    //     build = build2;
    // }

    // cb(null, build);
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
        // console.log('\n', build1);
    } else {
        build2 = build2.filter(item => item.itemId != itemId);
        cb(null, build2);
        // console.log('\n', build2);
    }
}

function clearBuild(buildId, cb) {
    // var build;

    if (buildId == 1) {
        build1 = [];
        cb(null, build1);
    }

}

module.exports = {
    getItemTypes,
    getUserByEmail,
    createUser,
    getBuildById,
    getItemsByType,
    removeItemFromBuild,
    clearBuild,
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