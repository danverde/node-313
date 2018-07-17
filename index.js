/* eslint no-console:0 */

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const session = require('express-session');

const controller = require('./controller.js');

/* setup express */
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'fuzzy Kittens',
    resave: false,
    saveUninitialized: true
}));

app.use(controller.logRequest);
app.use((req, res, next) => {
    if (req.session.message == undefined)
        req = controller.resetMessage(req);
    next();
});

/******************************
 * START ROUTING
 ******************************/

/* All GET requests */
app.get('/', controller.verifyLogin, controller.goHome);
app.get('/login', (req, res) => {
    /* shouldn't be able to log in if you're lready logged in... */
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    /* set view Data */
    var viewData = {
        loggedIn: req.session.loggedIn, 
        message: req.session.message
    };
    /* reset message */
    req = controller.resetMessage(req);
    
    res.render('pages/login', viewData);
});

app.get('/register', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    } else {
        var viewData = {loggedIn: req.session.loggedIn, 
            message: req.session.message
        };

        req = controller.resetMessage(req);
        res.render('pages/register', viewData);
    }
});

app.get('/builds', controller.verifyLogin, (req, res) => {
    // TODO remove default build ID
    var activeBuildId = 1;
    res.redirect(`builds/${activeBuildId}`);
});

app.get('/builds/:buildId', controller.verifyLogin, controller.getBuild);
app.get('/items', controller.verifyLogin, (req, res) => {
    res.redirect('items/1');
});

app.get('/items/:typeId', controller.verifyLogin, controller.getItems);


/* All POST requests */
app.post('/login', controller.login);
app.post('/logout', controller.logout);
app.post('/register', controller.register);
// app.post('/builds/:buildId', controller.setActiveBuild);
app.post('/builds/:buildId/:itemId', controller.addItemToBuild);


/* All PUT requests */
// app.put('/builds/:buildId/:itemId', controller.changeitemQuantity);

// TODO make these PUT requests
// ERROR how do we know if we are adding or removing from the build???
app.put('/builds/:buildId', controller.clearBuild);
app.put('/builds/:buildId/:itemId', controller.removeItemFromBuild);


/* All DELETE requests */


/* Default route (404) */
app.use((req, res) => {
    res.status(404);
    res.render('pages/404');
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));