const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL; // TODO get this working! || 'postgres://ta_user:ta_pass@localhost:5432/familyhistory';
const pool = new Pool({connectionString: connectionString});


/* global server vars */
var loggedIn = true;


/* setup express */
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
 

/* All GET requests */
app.get('/', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    res.render('pages/home', {loggedIn});
});

app.get('/logout', (req, res) => {
    if (loggedIn === true) {
        loggedIn = false;
    } 
    res.redirect('login');
});

app.get('/login', (req, res) => {
    /* shouldn't be able to log in if you're lready logged in... */
    if (loggedIn === true)
        res.redirect('/');
    else
        res.render('pages/login', {loggedIn});
});

app.get('/register', (req, res) => {
    if (loggedIn === true) {
        res.redirect('/');
        return;
    }
    
    res.render('pages/register', {loggedIn});
});

app.get('/builds', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    var activeBuildId = 1;
    res.redirect(`builds/${activeBuildId}`);
});

app.get('/builds/:buildId', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    res.render('pages/builds', {loggedIn});
});

app.get('/items', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    res.redirect('items/1');
});

app.get('/items/:typeId', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    res.render('pages/items', {loggedIn});
});


/* all POST requests */
app.post('/login', login);
app.post('/register', register);
app.post('/builds/:buildId', setActiveBuild);
app.post('/items/:typeId/:itemId', addItemToBuild);

/* all PUT requests */
app.put('/items/:typeId/:itemId', changeitemQuantity);

/* all DELETE requests */
app.delete('/items/:typeId/:itemId', deleteItem);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));


/* helper functions */

function login(req, res) {

}

function register(req, res) {

}


function setActiveBuild(req, res) {

}

function addItemToBuild(req, res) {

}

function changeitemQuantity(req, res) {

}

function deleteItem(req, res) {

}