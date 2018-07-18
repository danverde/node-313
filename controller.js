/* eslint no-console:0 */

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

        req = resetMessage(req);
        res.render('pages/home', viewData);
    });
}

function getBuild(req, res) {
    var buildId = req.session.buildId;

    model.getBuildById(buildId, (err, build) => {
        if (err) {
            console.error(err);
            req.session.message.text = 'Unable to get build';
            req.session.message.type = 'error';
        }
        // console.log('DA BUILD:', build);
        /* calculate total price */
        var totalPrice = build.reduce((totalPrice, item) => {
            totalPrice += item.price;
            return totalPrice;
        }, 0);

        let viewData = {
            loggedIn: req.session.loggedIn,
            message: req.session.message,
            items: build,
            totalPrice
        };

        req = resetMessage(req);
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
                req.session.message.text = 'Unable to get build';
                req.session.message.type = 'error';
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

            req = resetMessage(req);

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
        req.session.message.text = 'Missing Email OR Password';
        req.session.message.type = 'error';
        console.error(new Error('Missing Email OR Password'));
        res.redirect('/login');
        return;
    }

    model.getUserByEmail(email, (err, user) => {
        if (err) {
            req.session.message.text = 'Unable to find user';
            req.session.message.type = 'error';
            console.error(err);
            res.redirect('/login');
            return;
        } else if (user === null) {
            console.log('no user with that email found');
            req.session.message.type = 'error';
            req.session.message.text = 'Invalid Email or Password';
            res.redirect('/login');
            return;
        }
        var passwordHash = user.password;

        bcrypt.compare(password, passwordHash, (err, match) => {
            if (err) {
                console.error(err);
                res.redirect('/login');
                return;
            }

            if (match === false) {
                req.session.message.type = 'error';
                req.session.message.text = 'Invalid Email or Password';
                res.redirect('/login');
                return;
            }
            model.getBuildByUser(user.userid, (err, build) => {
                if (err) {
                    console.error(err);
                    req.session.message.type = 'error';
                    req.session.message.text = 'Unable to get user build';
                    res.redirect('/login');
                    return;
                }

                req.session.buildId = build.buildid;
                req.session.email = email;
                req.session.loggedIn = true;
                res.redirect('/');
            });
        });
    });
}

function logout(req, res) {
    req.session.destroy();
    res.redirect('login');
}

function register(req, res) {
    if (req.body.password != req.body.confirmPassword) {
        console.log('passwords didn\'t match');
        req.session.message.type = 'error';
        req.session.message.text = 'Passwords must match';
        res.redirect('/register');
        return;
    }

    /* Ensure email is not already in use */
    model.getUserByEmail(req.body.email, (err, user) => {
        if (err) {
            req.session.message.type = 'error';
            req.session.message.text = 'An error occurred. Please try again later.';
            console.error(err);
            res.redirect('/register');
            return;
        } else if (user !== null) {
            req.session.message.type = 'error';
            req.session.message.text = 'Email already in use';
            res.redirect('/register');
            return;
        }

        /* Encrypt password */
        bcrypt.hash(req.body.password, bcrypt.genSaltSync(), null, (err, passwordHash) => {
            if (err) {
                console.error(err);
                req.session.message.type = 'error';
                req.session.message.text = 'Invalid password';
                res.redirect('/register');
                return;
            }

            var userData = {
                firstName: req.body.fName,
                lastName: req.body.lName,
                email: req.body.email,
                password: passwordHash
            };

            /* create user */
            model.createUser(userData, (err, userId, buildId) => {
                if (err) {
                    req.session.message.type = 'error';
                    req.session.message.text = 'An error occurred. Please try again later.';
                    console.error(err);
                    res.redirect('/register');
                    return;
                }

                req.session.loggedIn = true;
                req.session.email = userData.email;
                req.session.buildId = buildId;

                res.redirect('/');
            });
        });
    });
}

// TODO this function
function addItemToBuild(req, res) {

}


/* PUT */
function removeItemFromBuild(req, res) {
    var buildId = req.params.buildId;
    var itemId = req.params.itemId;

    model.removeItemFromBuild(buildId, itemId, (err, build) => {
        if (err) {
            console.error(err);
            res.status(500);
            res.json(err);
            return;
        }

        res.json(build);
    });
}

function clearBuild(req, res) {
    var buildId = req.session.buildId;

    model.clearBuild(buildId, (err) => {
        if (err) {
            console.error(err);
            res.status(500);
            res.json(err);
            return;
        }

        model.getBuildById(buildId, (err, build) => {
            if (err) {
                console.error(err);
                res.status(500);
                res.json(err);
                return;
            }

            console.log(`build: ${build}`);
            res.json(build);
        });
    });
}

/* DELETE */


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

function resetMessage(req) {
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
    addItemToBuild,
    removeItemFromBuild,
    clearBuild,
    verifyLogin,
    logRequest,
    resetMessage,
};