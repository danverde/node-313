const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const controller = require('./controller.js');
const model = require('./model.js');

// global server vars
var loggedIn = true;
var message = '';
var activeBuildId = 1;

var viewData = {
    loggedIn,
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


/* All GET requests */
app.get('/', controller.goHome);
app.get('/login', (req, res) => {
    /* shouldn't be able to log in if you're lready logged in... */
    if (loggedIn === true) {
        res.redirect('/');
        return;
    }

    res.render('pages/login', viewData);
});

app.get('/logout', (req, res) => {
    if (loggedIn === true) {
        loggedIn = false;
    }
    res.redirect('login');
});


app.get('/register', (req, res) => {
    if (loggedIn === true) 
        res.redirect('/');
    else 
        res.render('pages/register', viewData);
});

app.get('/builds', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    var activeBuildId = 1;
    res.redirect(`builds/${activeBuildId}`);
});

app.get('/builds/:buildId', controller.getBuild);

app.get('/items', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    res.redirect('items/1');
});

app.get('/items/:typeId', controller.getItems);


/* all POST requests */
app.post('/login', controller.login);
app.post('/register', controller.register);
app.post('/builds/:buildId', controller.setActiveBuild);
app.post('/builds/:buildId/:itemId', controller.addItemToBuild);


/* all PUT requests */
app.put('/builds/:buildId/:itemId', controller.changeitemQuantity);


/* all DELETE requests */
app.delete('/builds/:buildId/:itemId', controller.removeItemFromBuild);



app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));