const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
 
app.set('view engine', 'ejs');





app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));