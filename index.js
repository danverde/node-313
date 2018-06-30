const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL; // TODO get this working! || 'postgres://ta_user:ta_pass@localhost:5432/familyhistory';
const pool = new Pool({connectionString: connectionString});


/* setup express */
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
app.get('/viewbuild', sendToActiveBuild);
// TODO this will need logic to fill out the JSON
app.get('/viewbuild/:buildId', (req, res) => res.render('pages/viewBuild'));
app.get('/items', (req, res) => res.redirect('items/1'));
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


/* helper functions */

function login(req, res) {

}

function register(req, res) {

}

function sendToActiveBuild(req, res) {
    var activeBuildId = 1;
    res.redirect(`viewBuild/${activeBuildId}`);
}

function setActiveBuild(req, res) {

}

function addItemToBuild(req, res) {

}

function changeitemQuantity(req, res) {

}

function deleteItem(req, res) {

}