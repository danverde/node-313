const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const controller = require('./controller.js');
const model = require('./model.js');


const {
    Pool
} = require('pg');
const connectionString = process.env.DATABASE_URL; // TODO get this working! || 'postgres://ta_user:ta_pass@localhost:5432/familyhistory';
const pool = new Pool({
    connectionString: connectionString
});


/* global server vars */
var loggedIn = true;
var activeBuildId = 1;

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
app.get('/', (req, res) => {
    if (loggedIn === false) {
        res.redirect('login');
        return;
    }

    //TODO get data from DB

    let viewData = {
        loggedIn,
        itemTypes: [{
            itemTypeName: 'Motherboards',
            itemTypeId: 1
        }, {
            itemTypeName: 'RAM',
            itemTypeId: 2
        }]
    };

    res.render('pages/home', viewData);
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
        res.render('pages/login', {
            loggedIn
        });
});

app.get('/register', (req, res) => {
    if (loggedIn === true) {
        res.redirect('/');
        return;
    }

    res.render('pages/register', {
        loggedIn
    });
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

    //TODO get buildID from DB
    let viewData = {
        loggedIn,
        items: [{
            itemTypeId: 1,
            itemTypeName: 'Motherboard'    ,
            itemId: 7,
            itemName: 'Cheapie MB',
            itemPrice: 25
        }, {
            itemTypeId: 2,
            itemTypeName: 'RAM'    ,
            itemId: 18,
            itemName: 'Cheapie RAM',
            itemPrice: 3
        }],
        totalPrice: 28
    };

    res.render('pages/builds', viewData);
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

    let viewData = {
        loggedIn,
        itemTypeName: 'Motherboards',
        items: [{
            itemId: 1,
            itemName: 'Z97-AR.jpg',
            itemPrice: 100,
            itemDescription: 'This is really cool item that you shoud get',
            itemImagePath: '/images/z97ar.jpg',
            isActive: true
        }, {
            itemId: 2,
            itemName: 'x299e',
            itemPrice: 30,
            itemDescription: 'This is really cool item that you shoud get',
            itemImagePath: '/images/x299e.jpg',
            isActive: false
        }],
    };

    res.render('pages/items', viewData);
});


/* all POST requests */
app.post('/login', controller.login);
app.post('/register', controller.register);
app.post('/builds/:buildId', controller.setActiveBuild);
app.post('/items/:typeId/:itemId', controller.addItemToBuild);


/* all PUT requests */
app.put('/items/:typeId/:itemId', controller.changeitemQuantity);


/* all DELETE requests */
app.delete('/items/:typeId/:itemId', controller.removeItemFromBuild);



app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));