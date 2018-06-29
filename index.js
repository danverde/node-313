const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;


var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
 

/* All GET requests */
app.get('/', (req, res) => res.render('pages/index'));
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));
// app.get('/viewbuild', (req, res) => res.redirect('pages/viewBuild/1')); // TODO needs an OPTIONAL ID parameter b& logic
app.get('/viewbuild/:buildId', (req, res) => res.render('pages/viewBuild')); // TODO needs an OPTIONAL ID parameter b& logic
app.get('/items/:typeId', (req, res) => res.render('pages/items'));

/* all POST requests */
app.post('/login', login);
app.post('/register', register);
app.post('/viewbuild/:buildId', setActiveBuild);
app.post('/items/:typeId/:itemId', addItemToBuild);

/* all PUT requests */
app.put('/items/:typeId/:itemId', changeitemQuantity);

/* all DELETE requests */
app.delete('/items/:typeId/:itemId', deleteItem);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));


/* helper function */

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