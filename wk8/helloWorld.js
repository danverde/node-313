/* eslint no-console: 0 */

const http = require('http');
const fs = require('fs');
const port = process.argv[2] === undefined ? 8080 : process.argv[2];


function sendHome(res) {
    fs.readFile('./welcome.html', (err, guts) => {
        if (err) {
            res.writeHead(500, {
                'content-type': 'text/plain'
            });
            res.write('Something went terribly wrong!');
            res.end();
        } else {
            res.writeHead(200, {
                'content-type': 'text/html'
            });
            res.write(guts);
            res.end();
        }
    });
}

function getData(res) {
    res.writeHead(200, {
        'content-type': 'application/json'
    });
    const data = '{"name":"Br. Burton","class":"cs313"}';

    res.write(data);
    res.end();
}

function notFound(res) {
    fs.readFile('./404.html', (err, guts) => {
        if (err) {
            res.writeHead(500, {
                'content-type': 'text/plain'
            });
            res.write('Something went terribly wrong!');
            res.end();
        } else {
            res.writeHead(404, {
                'content-type': 'text/html'
            });
            res.write(guts);
            res.end();
        }
    });
}

function onRequest(req, res) {
    console.log(req.url);

    if (req.url === '/home') {
        sendHome(res);
    } else if (req.url === '/getData') {
        getData(res);
    } else {
        notFound(res);
    }
}


var server = http.createServer(onRequest);
server.listen(port);
console.log(`Server running at: http://localhost:${port}`);