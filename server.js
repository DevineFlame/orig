var os = require('os');
var static = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

var port=2013;
var fileServer = new(static.Server)();
var app = http.createServer(function (req, res) {
  fileServer.serve(req, res);
}).listen(port);

var io = socketIO.listen(app);
//socket.broadcast.to(otherSocket.id).emit('hello', msg);

var rooms=[];
var peers=[];
var users=[];
var clients=[];
var socket_id=[];

var address="http://localhost:"+port+"?";

io.sockets.on('connection', function (socket){

    // convenience function to log server messages on the client
    function log(){
		var array = [">>> Message from server:"];
        array.push.apply(array, arguments);
	    socket.emit('log', array);
	}
function logTo(conn){
		var array = [">>> Message from server:"];
        array.push.apply(array, arguments);
	    conn.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Client said:', message);
        // for a real app, would be room only (not broadcast)
		socket.broadcast.emit('message', message);
	});
////////////////////////////////////calls to server/////////////////////////////////
	socket.on('connect',connect_user);
	socket.on('create_room',create_room);
	socket.on('join_room',join_room);
	socket.on('grant_permission',grant_permit);
	socket.on('deny_permission',deny_permit);
	socket.on('disconnect_user',disconnect_user);
	socket.on('exit_user',exit_user);

	socket.on('candidate',exit_user);
/////////////////////////////////functions/////////////////////////////////
	

	function disconnect_user(data){
   
         var user=data.name;
         var room=data.room;

         if(rooms[room]){
         	socket.leave(room);
         	var creator=rooms[room];
         	log("user "+user+" leaved "+room+" created by "+creator);
         	 io.sockets.in(creator).emit("user_leave",{'peer':user,'room':room,'creator':creator});
         }
     else{
       log("you are not connected to anyone");
     }

	}

	function exit_user(data){
		if(data){
		var name=data.name;
		var room=name;
		var creator=rooms[room];
		var user=name;

		delete users[data.name];// jai shri ram jai bajarangbali;jai maa sharada ;jai maa kali
		delete rooms[data.name];

		io.sockets.in(room).emit("user_exit",{'peer':user,'room':room,'creator':creator});

	}
	}

   function connect_user(data){
   	var name=data.name;
   
   	if(socket_id[name]){
   		socket.emit("user_exist");
   	}else{

   	 console.info('New client connected (id=' + socket.id + ').');
     clients.push(socket);
	
   	 users[name]=name;         // till he not create this is default room
   	 socket_id[name]=socket.id;
   	 socket.join(name);
   	 socket.emit("connected");
   	 
     }
   }


	function create_room(data){
		var room=data.room;
		var user=data.user;
		 //io.sockets.in(user)
	
		log('client said make rooom -->',data.user,data.room);
		if(rooms[data.room]){
			log('sorry make some another room',data.user);
		}
		else{
			log('hurray your  room is',data.room);
			rooms[data.room]=data.user;
			users[user]=data.room;          // here change the room that can be changed till now it is the usename
					
			//console.log(users[data.name]);
			log(data.user+"creates "+data.room);
			socket.join(room);
			address=address+room;
			 socket.emit('room_created', address);
		}
	}

	function join_room(data){
		var room=data.room;
		var user=data.user;

		log('client asked for rooom -->',data.user,rooms[room]);
		if(users[data.user]){
			log("user still exist");
		}
		if(rooms[room]){

			log('yah bro room is available room.initiator is ',rooms[room]);
			var creator=rooms[room];
			
			socket.join(creator);
			//console.log(socket_id.length);
			//console.log("room created by "+socket_id[creator]);
			
			//io.sockets.in(creator).emit("test_me",{"user":creator,"room":room});
			notifyRoomCreator(user,room,creator,"join");  //notify the creator that user wants to join you 

		}
		else{
			log("soory bro room is not live");
		}
	}



function notifyRoomCreator(curr_pear,room,creator,type){
	if(type==="leave"){
			log(curr_pear+"wants to leave room "+room+"started by"+creator);
			removePearFromRoom(curr_pear,room,creator);
		}
    else if(type=="join"){
    	  	log(curr_pear+"wants to join room "+room+"started by"+creator);
    	  	addPearToRoom(curr_pear,room,creator);
	     	//io.sockets.in('rdyrx').emit('get_permit',{'peer':curr_pear});  // get permission from user who created room
	     //	io.sockets.in('rdyx').emit('peer_connected_to_room',{'peer':curr_pear,'creator':creator,'room':room});
	    	
    }
}

function addPearToRoom(curr_pear,room,creator){
        
            // push  the user in the peer connection       
        log("here is room -->",room);
       // io.sockets.in(creator).emit('peer_connected_to_room',{'peer':curr_pear,'room':room,'creator':creator} );
        io.sockets.in(creator).emit("peer_connected_to_room",{'peer':curr_pear,'room':room,'creator':creator});
       

}
function removePearFromRoom(curr_pear,room,room_init){

}


});



function grant_permit(data){
log("permission_ granted  to"+data.peer+"created by:"+data.user+"room->"+data.room);
curr_pear=data.peer;
room=data.room;
room_init=data.room_init;
addPearToRoom(curr_pear,room,room_init);
}

function deny_permit(data){
socket.emit("permission_denied",data);
}
