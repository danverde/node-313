/* eslint no-console:0 */

const asyncLib = require('async');
const {
    Pool
} = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://nodeuser:admin@localhost:5432/builds';
const pool = new Pool({
    connectionString: connectionString
});

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
    var params = [
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password
    ];

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

function getItemTypes(cb) {
    pool.query('SELECT * FROM itemType', (err, result) => {
        if (err) {
            cb(err, null);
            return;
        }
        cb(null, result.rows);
    });
}

function getBuildById(buildId, cb) {
    pool.query(`SELECT i.name, i.price, it.itemTypeName, it.itemTypeId
        FROM items AS i
        INNER JOIN builds AS bu ON (bu.buildId = $1)
        INNER JOIN itemType AS it USING (itemTypeId)
        WHERE bu.motherboardId = i.itemId
        OR bu.cpuId = i.itemId
        OR bu.gpuId = i.itemId
        OR bu.storageId = i.itemId
        OR bu.memoryId = i.itemId
        OR bu.towerId = i.itemId
        OR bu.fanId = i.itemId
        OR bu.psuId = i.itemId`, [buildId], (err, build) => {
        if (err) {
            cb(err, null);
            return;
        }
        // console.log(build);

        cb(null, build.rows);
    });
}

function getBuildByUser(userId, cb) {
    pool.query('SELECT * FROM builds WHERE userId=$1;', [userId], (err, build) => {
        if (err) {
            cb(err, null);
        } else if (build.rowCount === 0) {
            cb(new Error('Unable to find matching build'), null);
        } else {
            cb(null, build.rows[0]);
        }
    });
}

function getItemsByType(typeId, cb) {
    var items,
        itemTypeName;

    pool.query(`SELECT itemId, name, description, price, imageLocation FROM items AS i 
        JOIN itemType AS it USING(itemTypeId)
        WHERE it.itemTypeId = $1`, [typeId], (err, results) => {
        if (err) {
            cb(err, null, null);
            return;
        }
        
        items = results.rows;

        pool.query('SELECT itemTypeName FROM itemType WHERE itemTypeId=$1', [typeId], (err, results) => {
            if (err) {
                cb(err, items, null);
                return;
            }

            itemTypeName = results.rows[0].itemtypename;

            cb(null, items, itemTypeName);
        });
    });
}

function addItemToBuild(itemId, itemTypeName, buildId, cb) {
    /* This is nasty... but it has to be done. There is no other way to dynamically select a column */
    pool.query(`UPDATE builds SET ${itemTypeName}=$1 WHERE buildId = $2`, [itemId, buildId], (err, result) => {
        if (err)
            cb(err);
        else
            cb(null);
    });
}

function removeItemFromBuild(buildId, itemTypeName, cb) {
    pool.query(`UPDATE builds SET ${itemTypeName}Id=NULL WHERE buildId=$1`, [buildId], (err, result) => {
        if (err)
            cb(err);
        else
            cb(null);
    });
}

function clearBuild(buildId, cb) {
    console.log(`build id: ${buildId}`);
    pool.query(`UPDATE builds 
        SET (motherboardId, cpuId, gpuId, fanId, memoryId, storageId, towerId, psuId)= (null, null, null, null, null, null, null, null)
        WHERE buildId=$1`, [buildId], (err, result) => {
        if (err)
            cb(err);
        else
            cb(null);
        console.log(result);
    });
}

module.exports = {
    getItemTypes,
    getUserByEmail,
    createUser,
    getBuildByUser,
    getBuildById,
    getItemsByType,
    addItemToBuild,
    removeItemFromBuild,
    clearBuild,
};


/* HARD-CODED values for TESTING */
/* Eventually these will be replaced by the DB... */

// var build1 = [{
//     itemTypeId: 1,
//     itemTypeName: 'Motherboard',
//     itemId: 1,
//     itemName: 'Z97-AR.jpg',
//     itemPrice: 100
// }, {
//     itemTypeId: 2,
//     itemTypeName: 'RAM',
//     itemId: 3,
//     itemName: 'Tridentz RGB',
//     itemPrice: 100
// }];

// var build2 = [{
//     itemTypeId: 1,
//     itemTypeName: 'Motherboard',
//     itemId: 2,
//     itemName: 'x299e',
//     itemPrice: 30
// }, {
//     itemTypeId: 2,
//     itemTypeName: 'RAM',
//     itemId: 4,
//     itemName: 'Corsair Vengance',
//     itemPrice: 30
// }];

// var motherboards = [{
//     itemId: 1,
//     itemName: 'Z97-AR.jpg',
//     itemPrice: 100,
//     itemDescription: 'This is a really cool item that you shoud get',
//     itemImagePath: '/images/z97ar.jpg',
// }, {
//     itemId: 2,
//     itemName: 'x299e',
//     itemPrice: 30,
//     itemDescription: 'This is a really cool item that you shoud get',
//     itemImagePath: '/images/x299e.jpg',
// }];

// var ram = [{
//     itemId: 3,
//     itemName: 'Tridentz RGB',
//     itemPrice: 100,
//     itemDescription: 'This is a really cool item that you shoud get',
//     itemImagePath: '/images/tridentz.jpg',
// }, {
//     itemId: 4,
//     itemName: 'Corsair Vengance',
//     itemPrice: 30,
//     itemDescription: 'This is a really cool item that you shoud get',
//     itemImagePath: '/images/vengance.jpg',
// }];