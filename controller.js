const bcrypt = require('bcrypt-nodejs');
const chalk = require('chalk');

const model = require('./model.js');

/* GET */
function goHome(req, res) {
    model.getItemTypes((err, itemTypes) => {
        if (err) {
            console.error(err);
            req.session.message.text = 'Unable to get Item Types';
            req.session.message.type = 'error';
        }

        var viewData = {
            loggedIn: req.session.loggedIn,
            message: req.session.message,
            itemTypes
        };

        res.render('pages/home', viewData);
    });
}

function getBuild(req, res) {
    req.session.message = {
        text: '',
        type: ''
    };

    var buildId = req.params.buildId;

    model.getBuildById(buildId, (err, build) => {
        if (err) {
            console.error(err);
            req.session.message.text = 'Unable to get build';
            req.session.message.type = 'error';
        }

        /* calculate total price */
        var totalPrice = build.reduce((totalPrice, item) => {
            totalPrice += item.itemPrice;
            return totalPrice;
        }, 0);

        let viewData = {
            loggedIn: req.session.loggedIn,
            message: req.session.message,
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
            console.error(err);
            req.session.message.text = `Unable to get ${itemTypeName} items`;
            req.session.message.type = 'error';
        }

        var viewData = {
            itemTypeName,
            items,
        };

        // TODO set activeBuildId
        var activeBuildId = 1;
        model.getBuildById(activeBuildId, (err, build) => {
            if (err) {
                console.log(err);
            }

            // console.log('bleh\n', build);
            var buildItem = build.find(buildItem => buildItem.itemTypeId == typeId);
            // console.log(buildItem);

            if (buildItem) {
                var activeItemId = buildItem.itemId;

                viewData.items.forEach(item => {
                    if (item.itemId === activeItemId)
                        item.isActive = true;
                });
            }

            viewData.loggedIn = req.session.loggedIn;
            viewData.message = req.session.message;

            res.render('pages/items', viewData);
        });
    });
}

/* POST */
function login(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    req.session.message = {
        text: '',
        type: ''
    };

    /* make sure an email & password were provided */
    if (!email || !password) { 
        req.session.message.text = 'Missing Email OR Password';
        req.session.message.type = 'error';
        console.error(new Error('Missing Email OR Password'));
        res.redirect('/login');
        return;
    }

    model.getLoginCredentials(email, (err, passwordHash, userId) => {
        if (err) {
            console.error(err);
            res.redirect('/login');
            return;
        }
        // Check to see if userId is null (no match)!!
        if (userId === null) {
            console.log('no user with that email found');
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
                model.getUserBuild;
                req.session.email = email;
                req.session.loggedIn = true;
                res.redirect('/');
                return;
            }
            res.redirect('/login');
        });
    });
}

function logout(req, res) {
    req.session.destroy();
    res.redirect('login');
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

    model.registerUser(userData, (err, userId) => {
        if (err) {
            res.redirect('/register');
            console.log('error with model');
            return;
        }

        res.session.loggedIn = true;
        res.session.email = userData.email;

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
        res.redirect('/login');
        return;
    }
    next();
}

function logRequest(req, res, next) {
    console.log(chalk.magenta(`${req.method}: ${req.url}`));
    next();
}

function clearMessage(req) {
    req.session.message = {
        text: '',
        type: ''
    };
    return req;
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
    logRequest,
    clearMessage,
};