const bcrypt = require('bcrypt-nodejs');

const model = require('./model.js');

// global server vars
// var loggedIn = true;
var activeBuildId = 1;
var message = {
    text: '',
    type: ''
};

/* GET */
function goHome(req, res) {
    model.getItemTypes((err, itemTypes) => {
        if (err) {
            //TODO handle err
        }

        var viewData = {
            loggedIn,
            itemTypes
        };

        res.render('pages/home', viewData);
    });
}

function getBuild(req, res) {
    var buildId = req.params.buildId;

    model.getBuildById(buildId, (err, build) => {
        if (err) {
            message.text = 'Unable to get build';
            message.type = 'error';
        }

        /* calculate total price */
        var totalPrice = build.reduce((totalPrice, item) => {
            totalPrice += item.itemPrice;
            return totalPrice;
        }, 0);

        let viewData = {
            loggedIn,
            message,
            items: build,
            totalPrice
        };

        res.render('pages/builds', viewData);
    });
}

function getItems(req, res) {
    var typeId = req.params.typeId;

    model.getItemsByType(typeId, (err, items, itemTypeName) => {
        if (err) {
            //TODO handle error
        }

        var viewData = {
            loggedIn,
            itemTypeName,
            items,
        };

        model.getBuildById(activeBuildId, (err, build) => {
            if (err) {
                console.log(err);
            }

            console.log('bleh\n', build);
            var buildItem = build.find(buildItem => buildItem.itemTypeId == typeId);
            // console.log(buildItem);

            if (buildItem) {
                var activeItemId = buildItem.itemId;

                viewData.items.forEach(item => {
                    if (item.itemId === activeItemId)
                        item.isActive = true;
                });
            }

            res.render('pages/items', viewData);
        });
    });
}

/* POST */
function login(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    /* make sure an email & password were provided */
    if (!email || !password) {
        console.error(new Error('Missing Email OR Password'));
        res.redirect('/login');
        return;
    }

    model.getLoginCredentials(email, (err, passwordHash) => {
        if (err) {
            console.error(err);
            res.redirect('/login');
            return;
        }

        bcrypt.compare(password, passwordHash, (err, match) => {
            if (err) {
                console.error(err);
                res.redirect('/login');
                return;
            }


            if (match === true) {
                req.session.email = email;
                res.redirect('/');
                return;
            }
            res.redirect('/login');
        });
    });
}

function logout(req, res) {

}

function register(req, res) {
    if (req.body.password != req.body.confirmPassword) {
        res.redirect('/register');
        console.log('passwords didn\'t match');
        return;
    }

    var userData = {
        firstName: req.body.fName,
        lastName: req.body.lName,
        email: req.body.email,
        password: req.body.password
    };

    model.registerUser(userData, (err) => {
        if (err) {
            res.redirect('/register');
            console.log('error with model');
            return;
        }

        loggedIn = true;
        res.redirect('/');
        console.log('successfully registered');
    });
}



/* PUT */
function setActiveBuild(req, res) {

}

function addItemToBuild(req, res) {

}

function changeitemQuantity(req, res) {

}

/* DELETE */
function removeItemFromBuild(req, res) {
    var buildId = req.params.buildId;
    var itemId = req.params.itemId;

    model.removeItemFromBuild(buildId, itemId, (err, build) => {
        if (err) {
            console.log(err);
            return;
        }

        res.json(build);
    });
}

/* Middleware */

function verifyLogin(req, res, next) {
    if (!req.session.email) {
        res.redirect('login');
        return;
    }
    next();
}


module.exports = {
    goHome,
    getBuild,
    getItems,
    login,
    logout,
    register,
    setActiveBuild,
    addItemToBuild,
    changeitemQuantity,
    removeItemFromBuild,
    verifyLogin,
};