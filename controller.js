const model = require('./model.js');

// global server vars
var loggedIn = true;
var activeBuildId = 1;
var message = {
    text: '',
    type: ''
};

var viewData = {
    loggedIn,
    message
};

/* GET */
function goHome(req, res) {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

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
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

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

/* POST */
function login(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        res.redirect('/login');
        return;
    }

    model.getLoginCredentials(email, (err, passwordHash) => {
        if (err) {
            res.redirect('/login');
            return;
        }

        //TODO compare hashes

        loggedIn = true;
        res.redirect('/');
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

}

module.exports = {
    goHome,
    getBuild,
    login,
    logout,
    register,
    setActiveBuild,
    addItemToBuild,
    changeitemQuantity,
    removeItemFromBuild
};