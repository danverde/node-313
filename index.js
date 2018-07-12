const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const session = require('express-session');
const bcrypt =  require('bcrypt-nodejs');

const controller = require('./controller.js');
const model = require('./model.js');

// global server vars
var message = '';
var activeBuildId = 1;

var viewData = {
    loggedIn: true,
    message
};


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

// app.use(controller.verifyLogin);

/* All GET requests */
app.get('/', controller.verifyLogin, controller.goHome);
app.get('/login', (req, res) => {
    /* shouldn't be able to log in if you're lready logged in... */
    if (req.session.email) {
        res.redirect('/');
        return;
    }

    res.render('pages/login', viewData);
});

app.get('/logout', controller.verifyLogin, (req, res) => {
    res.redirect('login');
});


app.get('/register', controller.verifyLogin, (req, res) => {
    res.render('pages/register', viewData);
});

app.get('/builds', controller.verifyLogin, (req, res) => {
    var activeBuildId = 1;
    res.redirect(`builds/${activeBuildId}`);
});

app.get('/builds/:buildId', controller.verifyLogin, controller.getBuild);

app.get('/items', controller.verifyLogin, (req, res) => {
    res.redirect('items/1');
});

app.get('/items/:typeId', controller.verifyLogin, controller.getItems);


/* all POST requests */
app.post('/login', controller.login);
app.post('/register', controller.register);
app.post('/builds/:buildId', controller.setActiveBuild);
app.post('/builds/:buildId/:itemId', controller.addItemToBuild);


/* all PUT requests */
app.put('/builds/:buildId/:itemId', controller.changeitemQuantity);


/* all DELETE requests */
app.delete('/builds/:buildId/:itemId', controller.removeItemFromBuild);


/* Default route (404) */
app.use((req, res) => {
    res.status(404);
    res.render('pages/404');
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));