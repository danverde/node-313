const model = require('./model.js');

// global server vars
var loggedIn = true;
var activeBuildId = 1;


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

function logout (req, res) {
   
}

function register(req, res) {

}


function setActiveBuild(req, res) {

}

function addItemToBuild(req, res) {

}

function changeitemQuantity(req, res) {

}

function removeItemFromBuild(req, res) {

}

module.exports = {
    goHome,
    login,
    logout,
    register,
    setActiveBuild,
    addItemToBuild,
    changeitemQuantity,
    removeItemFromBuild
};