/****************************************************************************
 * Initial setup
 ****************************************************************************/

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

var localStream;
var localPeerConnection;
var remotePeerConnection;


// Attach even handlers
var pc;
var config;
var caller;
var peers=[];

  var servers = null;


var room=null;
var user=null;
var room_url=null;

var errorElement = document.querySelector('#errorMsg');

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
    local_stream=document.querySelector('video');
     start_stream_btn=document.getElementById("start_stream");
    stop_stream_btn=document.getElementById("stop_stream");

///////////////////////////////////////////////////////////functions/////////////////////////////////////////////
connect_btn.addEventListener('click',fresh_connect);
create_btn.addEventListener('click',start_room);
join_btn.addEventListener('click',join_room);
disconnect_btn.addEventListener('click',disconnect_user);
exit_btn.addEventListener('click',exit);
start_stream_btn.addEventListener('click',start_stream);
stop_stream_btn.addEventListener('click',stop_stream);

////////////////////////////////////////////////////////////functions definitions RTC PEER CONNECTION RELATED//////////////////////////////////

function gotRemoteStream(event) {
     var remote_video=document.getElementById('remote_video_stream');
     remote_video.srcObject = stream;
    
  remote_video.src = URL.createObjectURL(event.stream);
  trace('Received remote stream');

}



function gotLocalIceCandidate(event) {
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    trace('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function gotRemoteIceCandidate(event) {
  if (event.candidate) {
    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    trace('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

//////////////////////////////////video audio section/////////////////////////////


function start_stream() {
   
  
navigator.mediaDevices.getUserMedia({ video: true }, gotStream, function(error) {
    trace('navigator.getUserMedia error: ', error);
  }); 
//:this for local connection
  localPeerConnection = new RTCPeerConnection(servers);  // eslint-disable-line new-cap
  trace('Created local peer connection object localPeerConnection');
  localPeerConnection.onicecandidate = gotLocalIceCandidate;
//:this for remote connection
  remotePeerConnection =   new RTCPeerConnection(servers);  // eslint-disable-line new-cap
  trace('Created remote peer connection object remotePeerConnection');
  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
  remotePeerConnection.onTrack = gotRemoteStream;


  localPeerConnection.addStream(localStream);
  trace('Added localStream to localPeerConnection');
  localPeerConnection.createOffer(gotLocalDescription);



}


function gotStream(stream) {
  trace('Received local stream');
  local_stream_video.src = URL.createObjectURL(stream);
  localStream = stream;
//  callButton.disabled = false;
}


function stop_stream() {
    var local_video=document.getElementById('local_video_stream');
  //var remote_video=document.getElementById('remote_video_stream');
   local_video.srcObject = null;
}




function handleSuccess_local(stream) {           // stream for local 
  var local_video=document.getElementById('local_video_stream');
    local_video.srcObject = stream;
     localStream = stream;
  }


function handleSuccess_remote(stream) {           // stream for remote with some count
   var local_video=document.getElementById('local_video_stream');
     local_video.srcObject = stream;
     remoteStream=stream;
  }

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}



////////////////////////////////////////////////////////////functions definitions socket related///////////////////////////////////
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
}//////////////////////////////socket./////////////////////////////////////

socket.on('log', function (msg) {
    log(msg);
});


socket.on('peer_connected_to_room',function(data){
  if(user == data.creator){
    log("peer :"+data.peer+"connected to your room:"+data.room);
    createPeerConnection(false, configuration)
  }
  else if(user == data.peer){
    log("you are connected to :"+data.creator+" room is :"+data.room);
  }

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



socket.on('test_me',function(data){
     name=data.user;
     room=data.room;
     log("name-->"+name+"room--->"+room);
     alert("fklasdjfkl");
    

});

//////////////////////////////utility functions /////////////////////

function trace(arg) {
  var now = (window.performance.now() / 1000).toFixed(3);
  console.log(now + ': ', arg);
}