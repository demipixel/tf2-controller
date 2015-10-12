var robot = require('robotjs');
var express = require('express');
var app = express();

var ioapp = express();
var http = require('http').Server(ioapp);
var io = require('socket.io')(http);

//app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
//app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

http.listen(4000, function() {
	console.log('Listening for socket.io on 4000');
});

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
})

var direction = {
	left: false,
	right: false,
	forward: false,
	back: false
}

var mouseSpeed = {
	x: 0,
	y: 0
};
var MOUSE_SPEED = 200;
var relMousePos = {
	x: 0,
	y: 0
}

setInterval(function() {
	if (!mouseSpeed.x && !mouseSpeed.y) return;
	var pos = robot.getMousePos();
	var newpos = {
		x: pos.x + mouseSpeed.x/60*MOUSE_SPEED + relMousePos.x,
		y: pos.y + mouseSpeed.y/60*MOUSE_SPEED + relMousePos.y
	}
	robot.moveMouse(Math.floor(newpos.x), Math.floor(newpos.y));

	relMousePos.x = newpos.x - Math.floor(newpos.x);
	relMousePos.y = newpos.y - Math.floor(newpos.y);
}, 1/60);

io.on('connection', function(socket) {
	console.log('New connection');

	socket.on('joystick', function(pos) {
		//console.log(pos);
		if (pos.x > 1 || pos.x < -1 || pos.y > 1 || pos.y < -1) return;
		if (Math.abs(pos.x) + Math.abs(pos.y) < 0.4) {
			pos.x = 0;
			pos.y = 0;
		}
		var left = false;
		var right = false;
		var forward = false;
		var back = false;
		var angle = Math.atan2(pos.x, pos.y);

		if (angle > -Math.PI*2/6 && angle < Math.PI*2/6) back = true;
		if (angle > -Math.PI*5/6 && angle < -Math.PI*1/6) left = true;
		if (angle > Math.PI*1/6 && angle < Math.PI*5/6) right = true;
		if (angle > Math.PI*4/6 || angle < -Math.PI*4/6) forward = true;

		if (pos.x == 0 && pos.y == 0) {
			back = false; left = false; right = false; forward = false;
		}

		var newvalues = [forward, left, right, back];
		var strings = ['forward', 'left', 'right', 'back'];
		var keys = ['w', 'a', 'd', 's'];

		for (var n in newvalues) {
			keyChanges(newvalues[n], direction[strings[n]], keys[n]);
		}

		direction.left = left;
		direction.right = right;
		direction.forward = forward;
		direction.back = back;

		//console.log(direction);
	});

	socket.on('movemouse', function(pos) {
		console.log(pos);
		if (pos.x > 1 || pos.x < -1 || pos.y > 1 || pos.y < -1) return;
		if (Math.abs(pos.x) + Math.abs(pos.y) < 0.4) {
			pos.x = 0;
			pos.y = 0;
		}
		mouseSpeed.x = pos.x;
		mouseSpeed.y = pos.y;
	});

	var buttons = {
		jump: false,
		crouch: false,
		reload: false
	}
	
	socket.on('press', function(button) {
		buttonInteraction(button, true);
	});

	socket.on('release', function(button) {
		buttonInteraction(button, false);
	});

	function buttonInteraction(button, press) {
		//console.log('button',button);
		var found = false;
		for (var b in buttons) {
			if (b == button) {
				found = true;
				break;
			}
		}
		if (!found) return;

		if (button == 'jump') {
			keyChanges(press, buttons.jump, 'space');
		} else if (button == 'crouch') {
			keyChanges(press, buttons.crouch, 'control');
		}
		buttons[button] = press;
	}
});

function keyChanges(bool, confirm, key) {
	if (bool != confirm) {
		robot.keyToggle(key, (bool ? 1 : 0));
	}
}

var server = app.listen(3000, function() {
	console.log('Server is live');
});

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.get('/qr', function(req, res) {
	res.render('qr.ejs');
});








var ip = '';

'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      //console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      if (ifname == 'en0') {
      	ip = iface.address;
      	console.log(ip + ':3000');
      }
      //console.log(ifname, iface.address);
    }
    ++alias;
  });
});