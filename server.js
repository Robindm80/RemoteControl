//var http = require('http');
//var fs = require('fs');

//var server = http.createServer(function(req, res) {
    //fs.readFile('./index.html', 'utf-8', function(error, content) {
        //res.writeHead(200, {"Content-Type": "text/html"});
       // res.end(content);
    //});
//});

//var io = require('socket.io').listen(server, { log: false });
//server.listen(process.env.PORT);

//server.listen(3000, '0.0.0.0', function() {
 //   console.log('Listening to port:  ' + 3000);
//});

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


var allClients = [];
var line = 0;
var connectCounter = 0;

io.on('connection', function (socket) {
	connectCounter++;
	console.log(connectCounter);
		
	console.log("a newcomer in town");
    socket.join('gameroom');
    
    socket.username = 'gameroom';
    
    console.log(socket.username);
	
    
    countclients();
    
    //io.sockets.in('waiting room').emit('connectToRoom', "You are in the waitingroom");
    socket.to('gameroom').emit('connectToRoom', "Use the buttons to control the object");
    console.log("gave message to player");
	
    socket.on('disconnect', function() {
        console.log('disconnect');
		connectCounter--;
		console.log(connectCounter);
		
        leaverooms();
    
    });
    
        
    socket.on('right', function (data) {
		socket.to(socket.username).emit('right', data);
		console.log('right is being broadcasted');
	});
	
	socket.on('left', function (data) {
		socket.to(socket.username).emit('left', data);
		console.log('left is being broadcasted');
	});
	
	socket.on('explode', function (data) {
		socket.to(socket.username).emit('explode', data);
		console.log('explode is being broadcasted');
	});
	
	socket.on('implode', function (data) {
		socket.to(socket.username).emit('implode', data);
		console.log('implode is being broadcasted');
	});
	
	socket.on('blok', function (data) {
		socket.to(socket.username).emit('blok', data);
		console.log('blok is being broadcasted');
	});
	
	socket.on('reader', function (data) {
		socket.to(socket.username).emit('reader', data);
		console.log('reader is being broadcasted');
	});
	
	socket.on('color', function (data) {
		socket.to(socket.username).emit('color', data);
		console.log('color is being broadcasted');
	});

    socket.on('beenisolated', function (data) {
		socket.to('gameroom').emit('beenisolated', data);
		console.log('been isolated');
	});
	
	socket.on('exploded', function (data) {
		socket.to('gameroom').emit('exploded', data);
		console.log('just exploded');
	});
	
	socket.on('imploded', function (data) {
		socket.to('gameroom').emit('imploded', data);
		console.log('just imploded');
	});
	
	socket.on('reader', function (data) {
		socket.to('gameroom').emit('reader', data);
		console.log('the reader is back');
	});
	
	socket.on('letmein', function () {
		clearroom();
	});

function leaverooms(){
	  if (socket.username === "gameroom"){ 
			console.log("player left gameroom");
			moveplayers();
		}
		else if (socket.username === "waitingroom"){  
			console.log("player left waitingroom");
			var i = allClients.indexOf(socket);
			allClients[i].leave('waiting room');
			allClients.splice(i, 1);
			waitmessage();
		}
	}
	
  function countclients(){
	  if(io.nsps['/'].adapter.rooms['gameroom'] != undefined){
			if(io.nsps['/'].adapter.rooms['gameroom'].length > 2){
				
				socket.leave('gameroom');
				socket.join('waiting room');
				socket.username = 'waitingroom';
				allClients.push(socket);
		
				console.log(socket.username);
				
				//io.sockets.in('waiting room').emit('connectToRoom', "Please wait till other users are disconnected");
				io.sockets.in('waiting room').emit('overlayon', "");
				io.sockets.in('gameroom').emit('connectToRoom', "Use the buttons to control the object");
				waitmessage();
	}
  }
  }
  
  
	function moveplayers(){
	if (io.nsps['/'].adapter.rooms['waiting room'] != undefined){
		if(io.nsps['/'].adapter.rooms['gameroom'].length < 2 && io.nsps['/'].adapter.rooms['waiting room'].length > 0) {
			console.log('true');
			var i = 0;
			allClients[i].leave('waiting room');
			allClients[i].join('gameroom');
			allClients[i].username = 'gameroom';
			
			console.log(allClients[i].username);
		
			allClients.splice(i, 1);
			io.sockets.in('waiting room').emit('overlayon', "");
			io.sockets.in('gameroom').emit('connectToRoom', "Use the buttons to control the object");
			io.sockets.in('gameroom').emit('overlayoff', "");
			console.log("socket paased through here");
			waitmessage();
		}
  		} else {
			console.log("you made a wrong turn");
		}
	}
  
	function waitmessage(){
		for (var i = 0; i < allClients.length; i++){
			var j = i + 1;
			if ( i === 0){
			io.to(allClients[i].id).emit('queumessage', "You are first in line");
			}else if ( i === 1){
			io.to(allClients[i].id).emit('queumessage', "You are second in line");
			}else if ( i === 2){
			io.to(allClients[i].id).emit('queumessage', "You are third in line");
			}else {
			io.to(allClients[i].id).emit('queumessage', "You are " + j + "th in line");
			}

		}
	}
	
	function clearroom(){
		if(io.sockets.adapter.sids[socket.id]["gameroom"]){
			console.log("Unity is in the correct room");
		} else {
			console.log("oh oh Unity is left out to dry");
			socket.leave('waiting room');
			socket.join('gameroom');
			io.in('gameroom').clients((err, clients) => {
				console.log(clients); // an array containing socket ids in 'gameroom'
				let socket1 = io.sockets.connected[clients[1]];
				socket1.leave('gameroom');
				socket1.join('waiting room');
				allClients.push(socket1);
				moveplayers();
			});
		}
		
		
	}
  
	io.sockets.in('waiting room').emit('overlayon', "");
	io.sockets.in('gameroom').emit('overlayoff', "");
	io.sockets.in('gameroom').emit('connectToRoom', "Use the buttons to control the object");
  
	for(var i = 0; i < allClients.length; i++){
		console.log(allClients[i].id)
		console.log("the id of client 0: "+ allClients[0].id);
	}
    

});
