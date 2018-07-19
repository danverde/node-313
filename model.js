/* eslint no-console:0 */

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

                console.log(addBuildResult.rows);
                var buildId = addBuildResult.rows[0].buildid;
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
    pool.query(`SELECT i.itemId, i.name, i.price, it.itemTypeName, it.itemTypeId
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
    pool.query(`UPDATE builds SET ${itemTypeName}=$1 WHERE buildId = $2`, [itemId, buildId], (err) => {
        if (err)
            cb(err);
        else
            cb(null);
    });
}

function removeItemFromBuild(buildId, itemTypeName, cb) {
    pool.query(`UPDATE builds SET ${itemTypeName}Id=NULL WHERE buildId=$1`, [buildId], (err) => {
        if (err)
            cb(err);
        else
            cb(null);
    });
}

function clearBuild(buildId, cb) {
    pool.query(`UPDATE builds 
        SET (motherboardId, cpuId, gpuId, fanId, memoryId, storageId, towerId, psuId)= (null, null, null, null, null, null, null, null)
        WHERE buildId=$1`, [buildId], (err) => {
        if (err)
            cb(err);
        else
            cb(null);
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