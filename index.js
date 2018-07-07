const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const controller = require('./controller.js');
const model = require('./model.js');


// global server vars
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
app.get('/', controller.goHome);
app.get('/login', (req, res) => {
    /* shouldn't be able to log in if you're lready logged in... */
    if (loggedIn === true) {
        res.redirect('/');
        return;
    }

    res.render('pages/login', {loggedIn});
});

app.get('/logout', (req, res) => {
    if (loggedIn === true) {
        loggedIn = false;
    }
    res.redirect('login');
});


app.get('/register', (req, res) => {
    if (loggedIn === true) {
        res.redirect('/');
        return;
    }
    
    let userData;
    
    model.registerUser(userData, (err) => {
        if (err) {
            res.redirect('/register');
            return;
        }

        res.render('pages/register', {
            loggedIn
        });
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

    var buildId = req.params.buildId;

    model.getBuildById(buildId, (err, build) => {
        if (err) {
            //TODO handle error
        }

        /* calculate total price */
        var totalPrice = build.reduce((totalPrice, item) => {
            totalPrice += item.itemPrice;
            return totalPrice;
        }, 0);

        let viewData = {
            loggedIn,
            items: build,
            totalPrice
        };
        
        res.render('pages/builds', viewData);
    });
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

    var typeId = req.params.typeId;

    model.getItemsByType(typeId, (err, items, itemTypeName) => {
        if (err) {
            //TODO handlee error
        }

        let viewData = {
            loggedIn,
            itemTypeName,
            items,
        };
        
        res.render('pages/items', viewData);
    });
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