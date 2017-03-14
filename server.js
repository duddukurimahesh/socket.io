var express = require('express'),
	app		= express(),
	server  = require('http').createServer(app),
	io      = require('socket.io').listen(server),
	fs      = require('fs'),
	users   = {};

server.listen(3000);

app.get('/', function(req,res){
	res.sendfile(__dirname+'/index.html');
});

io.sockets.on('connection',function(socket){
	socket.on('new user',function(data,callback){
		if(data in users){
			callback(false);
		}else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});
	function updateNicknames(){
		io.sockets.emit('usernames',Object.keys(users));
	};
	socket.on('send message',function(data,callback){
		//console.log('message object is -----------@@@@@@@@@@@@@@@@--',socket);
		var msg = data.trim();
		if(data.substr(0, 3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ') //find index of first space.
			if(ind !== -1){
				var name = msg.substring(0,ind);
				var msg = msg.substring(ind+1);
				if(name in users){

					//Here need to write DB Query to store the messages.

					users[name].emit('whisper',{msg:msg,nick:socket.nickname});
					users[socket.nickname].emit('whisper',{msg:msg,nick:socket.nickname});
					console.log('------whisper------');
				}else{
					callback('Error: Enter valid user!');
				}
			}else{
				callback('Error: Please enter a message for your private chat.');
			}

		}else{
			callback('Error: Please select user.');
		}

		//io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
	});

	socket.on('disconnect',function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});

	/*// trying to serve the image file from the server
	io.on('connection', function(socket){
	  fs.readFile(__dirname + '/images/2.png', function(err, buf){
	    // it's possible to embed binary data
	    // within arbitrarily-complex objects
	    socket.emit('image', { image: true, buffer: buf.toString('base64') });
	    console.log('image file is initialized--------------@@@@@@@@@@@---------------');
	  });
	});*/

});