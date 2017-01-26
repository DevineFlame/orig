/****************************************************************************
 * Initial setup
 ****************************************************************************/

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

// Attach even handlers
var caller;
var peers=[];

var room=null;
var user=null;
var room_url=null;

var configuration = {'iceServers': [{}]};
////////////////////////////////////////////////////connect//////////////////////////////////
var socket = io.connect();
// {"url":"stun:stun.services.mozilla.com"}
////////////////////////////////////////////////////////BUTTONS//////////////////////////////////
    connect_btn=document.getElementById('connect');
    join_btn=document.getElementById('join_room');
    create_btn=document.getElementById('create_room');
    disconnect_btn=document.getElementById('disconnect_btn');
    exit_btn=document.getElementById('exit_btn');
    local_stream=document.getElementById('local_stream');

///////////////////////////////////////////////////////////functions/////////////////////////////////////////////
connect_btn.addEventListener('click',fresh_connect);
create_btn.addEventListener('click',start_room);
join_btn.addEventListener('click',join_room);
disconnect_btn.addEventListener('click',disconnect_user);
exit_btn.addEventListener('click',exit);

////////////////////////////////////////////////////////////functions definitions///////////////////////////////////
function exit(){
log("you are leaving");
socket.emit("exit_user",{'name':user});

}

function disconnect_user(){
    if(room){
    log("disconnect "+user+" from room-->"+room);
    
    socket.emit('disconnect_user',{"name":user,"room":room});
}
else{
    log("you are not connected to any room");
}

}

function fresh_connect(){
    name=$("#username").val();
   // alert(name);
    socket.emit("connect",{'name':name});
}


function start_room() {
    log("start_room");
     room=$("#username").val();
    user=$("#username").val();
    caller=user;
    socket.emit("create_room",{'room':room,'user':user});
}

function join_room(){
    log("connect_room");
    user=$("#username").val();
    caller=user;  ///   master user at time of 
   
    var room_url='http://localhost:2013?rdy'
    room=extract_room(room_url);
     
     room=$("#room_id").val();  // take input from the user     
     socket.emit("join_room",{'room':room,'user':user});
}


function join_room_by_url(){        /// if user enter url of some generated room
    log("connect_room");
    user=$("#username").val();
    caller=user;  ///   master user at time of 
   
    var room_url='http://localhost:2013?rdy'
    room=extract_room(room_url);
     
     room=$("#room_id").val();  // take input from the user     
     socket.emit("join_room",{'room':room,'user':user});
}


function log(msg){
    console.log(msg);
}

function logError(err) {
    console.log(err.toString(), err);
}

function extract_room(room_url){
     room=room_url.split('?')[1];   
    log("extractd room from url "+room);
    return room;
}
//////////////////////////////////video audio section/////////////////////////////


//////////////////////////////socket./////////////////////////////////////

socket.on('log', function (msg) {
    log(msg);
});


socket.on('user_exit',function(data){
  log("user "+data.peer+"exited from "+data.room);
});


socket.on('user_leave',function(data){         //function which decide who is going to leave

    if(user==data.peer){
  log("user "+data.peer+"leaved from "+data.room+"created by"+data.creator);
  
 

}
 if(user==data.creator){
  log("user "+data.peer+"leaved from "+data.room+"created by you mr."+data.creator);

}

else{
    log("user "+data.peer+"leaved the room");
}
});


socket.on('user_exist',function(data){
   
    log("user already exist try some other name");  

});


socket.on('connected',function(data){
 //  alert("heelo");
    log("congrats you are connected to server");  

});

socket.on('room_created',function(msg){

    log(msg);
});

socket.on('get_permit',function(data){
    peer=data.peer;   
    user=data.creator;
    room=data.room;
    ans=prompt("bro "+peer+"want to join you:(0|1)");
    if(ans){
        socket.emit('grant_permission',{'peer':peer,'creator':user,'room':room});
    }
    else{
        socket.emit('deny_permission',{'peer':peer,'creator':user,'room':room});
    }
    });




socket.on('permission_denied',function(data){
    curr_pear=data.pear;
    creator=data.creator;
    room=data.room;
    log("you are not allowed to connect");

    

});

socket.on('peer_connected_to_room',function(data){
  if(user == data.creator){
    log("peer :"+data.peer+"connected to your room:"+data.room);
  }
  else if(user == data.peer){
    log("you are connected to :"+data.creator+" room is :"+data.room);
  }

});



socket.on('test_me',function(data){
     name=data.user;
     room=data.room;
     log("name-->"+name+"room--->"+room);
     alert("fklasdjfkl");
    

});
