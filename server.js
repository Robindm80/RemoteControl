var http = require('http');
var fs = require('fs');
 
  
 var server = http.createServer(function(req, res) {
   fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });

var io = require('socket.io').listen(server, { log: false });
server.listen(process.env.PORT);

//server.listen(3000, '0.0.0.0', function() {
 //   console.log('Listening to port:  ' + 3000);
//});

var allClients = [];
var line = 0;

io.on('connection', function (socket) {
	console.log("a newcomer in town");
    socket.join('gameroom');
    
    socket.username = 'gameroom';
    
    console.log(socket.username);
    
    countclients();
    
    //io.sockets.in('waiting room').emit('connectToRoom', "You are in the waitingroom");
    io.sockets.in('gameroom').emit('connectToRoom', "Use the buttons to control the object");
    
    socket.on('disconnect', function() {
        console.log('disconnect');
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
				
				io.sockets.in('waiting room').emit('connectToRoom', "Please wait till other users are disconnected");
				io.sockets.in('gameroom').emit('connectToRoom', "Use the buttons to control the object");
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
		}
   }
	}
  
	
  
	io.sockets.in('waiting room').emit('connectToRoom', "You are in the waitingroom");
	io.sockets.in('gameroom').emit('connectToRoom', "You are in the gameroom");
  
	for(var i = 0; i < allClients.length; i++){
		console.log(allClients[i].id)
		console.log("the id of client 0: "+ allClients[0].id);
	}
    

});
