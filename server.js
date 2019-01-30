var http = require('http');
var url = require('url');
var fs = require('fs');
const app = require('./app')

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
})
