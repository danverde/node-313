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
    var activeBuildId = req.session.activeBuildId;
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


/* All PUT requests */
app.put('/builds/:buildId/:itemId', controller.addItemToBuild);


/* All DELETE requests */
app.delete('/builds/:buildId/motherboard', (req, res) => {
    controller.removeItemFromBuild(req, res, 'motherboard');
});

app.delete('/builds/:buildId/cpu', (req, res) => {
    controller.removeItemFromBuild(req, res, 'cpu');
});

app.delete('/builds/:buildId/gpu', (req, res) => {
    controller.removeItemFromBuild(req, res, 'gpu');
});

app.delete('/builds/:buildId/memory', (req, res) => {
    controller.removeItemFromBuild(req, res, 'memory');
});

app.delete('/builds/:buildId/storage', (req, res) => {
    controller.removeItemFromBuild(req, res, 'storage');
});

app.delete('/builds/:buildId/fan', (req, res) => {
    controller.removeItemFromBuild(req, res, 'fan');
});

app.delete('/builds/:buildId/tower', (req, res) => {
    controller.removeItemFromBuild(req, res, 'tower');
});

app.delete('/builds/:buildId/psu', (req, res) => {
    controller.removeItemFromBuild(req, res, 'psu');
});

app.delete('/builds/:buildId', controller.clearBuild);



/* Default route (404) */
app.use((req, res) => {
    res.status(404);
    res.render('pages/404');
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));