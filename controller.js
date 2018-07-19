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
    var buildId = req.params.buildId;

    /* make sure users don't edit other users builds */
    if (buildId != req.session.activeBuildId) {
        req.session.message.text = 'You are not authorized to access that item';
        req.session.message.type = 'error';
        res.redirect('/');
        return;
    }

    model.getBuildById(buildId, (err, build) => {
        if (err) {
            console.error(err);
            req.session.message.text = 'Unable to get build';
            req.session.message.type = 'error';
            res.redirect('/');
            return;
        }
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
    var typeId = req.params.typeId,
        activeBuildId = req.session.activeBuildId;

    model.getItemsByType(typeId, (err, items, itemtypename) => {
        if (err) {
            console.error(err);
            req.session.message.text = `Unable to get ${itemtypename} items`;
            req.session.message.type = 'error';
            req.redirect('/');
            return;
        }

        var viewData = {
            itemtypename,
            items,
        };

        /* determine if any items are currently in use by build */
        model.getBuildById(activeBuildId, (err, build) => {
            if (err) {
                console.error(err);
                req.session.message.text = 'Unable to get build';
                req.session.message.type = 'error';
                req.redirect('/');
                return;
            }

            var buildItem = build.find(buildItem => buildItem.itemtypeid == typeId);

            if (buildItem) {
                var activeItemId = buildItem.itemid;

                viewData.items.forEach(item => {
                    if (item.itemid === activeItemId)
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
            console.error(new Error('no user with that email found'));
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

                req.session.activeBuildId = build.buildid;
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
        console.error(new Error('passwords didn\'t match'));
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

                console.log('new Build Id:', buildId);

                req.session.loggedIn = true;
                req.session.email = userData.email;
                req.session.activeBuildId = buildId;

                res.redirect('/');
            });
        });
    });
}

function addItemToBuild(req, res) {
    var buildId = req.session.activeBuildId,
        itemId = req.body.itemId,
        // TODO how to get this param???
        itemTypeName = req.body.itemTypeName;

    model.addItemToBuild(itemId, itemTypeName, buildId, (err) => {
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

            res.json(build);
        });
    });
}


/* PUT */

/* DELETE */

function clearBuild(req, res) {
    // var buildId = req.session.activeBuildId;
    var buildId = req.params.buildId;

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

            res.json(build);
        });
    });
}

function removeItemFromBuild(req, res, itemTypeName) {
    var buildId = req.params.buildId;

    model.removeItemFromBuild(buildId, itemTypeName, (err, build) => {
        if (err) {
            console.error(err);
            res.status(500);
            res.json(err);
            return;
        }

        model.getBuildById(buildId, (err) => {
            if (err) {
                console.error(err);
                res.status(500);
                res.json(err);
                return;
            }
            res.json(build);
        });
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