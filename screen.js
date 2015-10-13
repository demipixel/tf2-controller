var robot = require('robotjs');
var express = require('express');

var ioapp = express();
var http = require('http').Server(ioapp);
var io = require('socket.io')(http);

var start = Date.now();
for (var i = 0; i < 100; i++) {
	var screen = robot.screen.capture();
	io.emit('image', screen.image.toString('base64'));
	console.log(i,(Date.now() - start)/1000 + 's');
}
console.log('Took ' + (Date.now() - start)/1000 + 's');