/****************************************************************************
 * Initial setup
 ****************************************************************************/

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

var first_time=true;
var localStream;
var remoteStream;
var localPeerConnection;
var remotePeerConnection;
var yourConn;
var peercount;

var mediaConstraints = {
  audio: true,            // We want an audio track
  video: true             // ...and we want a video track
};

// Attach even handlers

var config;
var caller;
var peers=[];

  var servers = null;


var room=null;
var user=null;
var room_url=null;

var errorElement = document.querySelector('#errorMsg');

var configuration = {'iceServers': [{}]};
var servers=null;
var  pc = new RTCPeerConnection(servers);
////////////////////////////////////////////////////connect//////////////////////////////////

//var conn = new WebSocket('wss://' + location.host + '/rdy');
log('wss://' + location.host + '/rdy');
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

 navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia;
   
    window.RTCPeerConnection = window.RTCPeerConnection 
          || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function init(){
     

      navigator.getUserMedia({ video: true, audio: true }, function (stream) { 
         localStream = stream;          
         //displaying local video stream on the page 
      //   localVideo.src = window.URL.createObjectURL(stream);
     
         //using Google public stun server 
         //{ "url": "stun:stun2.1.google.com:19302" }
         var configuration = { 
            "iceServers": []
         }; 
       
      

         //yourConn = new webkitRTCPeerConnection(configuration); 
         yourConn = new RTCPeerConnection(configuration);          
         // setup stream listening 
         yourConn.addStream(stream); 
        
    yourConn.ontrack = function(event) {
          document.getElementById("remote_video_stream").srcObject = event.streams[0];
         // document.getElementById("hangup-button").disabled = false;
        };
                 

          yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
                socket.emit('candidate',{'candidate':event.candidate,'user':user});
            } 
         };  

      
         
      }, function (error) { 
         console.log(error); 
      }); 
      first_time=false;
}

////////////////////////////////////////////////////video show  and leave ///////////////////////////////////////////////
function show_local_stream(stream){
     var local_video=document.getElementById('local_video_stream');
     local_video.srcObject = stream;
     localStream=stream;
     // attachMediaStream(local_video, stream);
}


function remove_local_stream(stream){
     var local_video=document.getElementById('local_video_stream');
      local_video.srcObject = null;
      localStream=null;
      
}


function show_remote_stream(stream){
     var remote_video=document.getElementById('remote_video_stream');
     remote_video.srcObject = stream;
      remoteStream=stream;
     // attachMediaStream(remote_video, stream);
}


function remove_remote_stream(stream){
     var remote_video=document.getElementById('remote_video_stream');
    remote_video.srcObject = stream;
      remoteStream=null;
     
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function start_stream() {  
if(first_time){
 navigator.getUserMedia({ video: true, audio: true }, function (stream) { 
         localStream = stream;
       },
  function (error) { 
         console.log(error); 
      }); 
}

  var configuration = { 
            "iceServers": []
         }; 
         yourConn = new RTCPeerConnection(configuration);          
         // setup stream listening 
         yourConn.addStream(localStream); 
         show_local_stream(localStream);

         /*
      
         yourConn.createOffer(function (offer) { 
        log("sender of offer is :"+user);
         socket.emit("offer",{'offer':offer,'user':user,'room':room});
         yourConn.setLocalDescription(offer); 
         
         show_local_stream(localStream);

      }, function (error) { 
         alert("Error when creating an offer"); 
      });


*/
   }  


function connect_new_peer(){         // this is for initiator
  if(first_time){
 navigator.getUserMedia({ video: true, audio: true }, function (stream) { 
         localStream = stream;
       },
  function (error) { 
         console.log(error); 
      }); 
}

    var configuration = { 
            "iceServers": []
         }; 
         yourConn = new RTCPeerConnection(configuration);          
         // setup stream listening 
         yourConn.addStream(localStream); 

   

           yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
                socket.emit('candidate',{'candidate':event.candidate,'user':user});
            } 
         }; 
           yourConn.ontrack = function(event) {
         // document.getElementById("remote_video_stream").srcObject = event.streams[0];
          show_remote_stream(event.streams[0]);
         // document.getElementById("hangup-button").disabled = false;
        }; 
}


function connect_to_room(){        // this is for peers
  var configuration = { 
            "iceServers": []
         }; 
         yourConn = new RTCPeerConnection(configuration);          
         // setup stream listening 
         yourConn.addStream(localStream); 

         yourConn.createOffer(function (offer) { 
        log("sender of offer is....new :"+user);
         socket.emit("offer",{'offer':offer,'user':user,'room':room});
         yourConn.setLocalDescription(offer); 

          yourConn.setRemoteDescription(new RTCSessionDescription(offer));
         
          show_local_stream(localStream);

      }, function (error) { 
         alert("Error when creating an offer"); 
      });

           yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
                socket.emit('candidate',{'candidate':event.candidate,'user':user});
            } 
         }; 
           yourConn.ontrack = function(event) {
          // document.getElementById("remote_video_stream").srcObject = event.streams[0];
          show_remote_stream(event.streams[0]);
         // document.getElementById("hangup-button").disabled = false;
        }; 

}


function join_stream() {     
 var local_video=document.getElementById('local_video_stream');
      local_video.srcObject = localStream; 

   }  

////////////////////////////////////////////sockets related to webrtc//////////////////////////////////////////


socket.on('peer_connected_to_room',function(data){
  if(user == data.creator){
    log("peer :"+data.peer+"connected to your room:"+data.room);
    connect_new_peer();    // connect newly coming peer
    
  }
  else if(user == data.peer){
   // init();
   room=data.room;
   connect_to_room();
    log("you are connected to :"+data.creator+" room is :"+data.room);

  }

});

socket.on('offer',function(data){
    var creator=data.user;        // user who created the room

    var curr_room=data.room;
    var offer=data.offer;
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));
   
   //create an answer to an offer 
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
      socket.emit('answer',{'answer':answer,'creator':creator,'user':user,'room':curr_room });
      
   }, function (error) { 
      alert("Error when creating an answer"); 
   }); 

});


socket.on('answer',function(data){
    var answer=data.answer;
   yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
   log("answer got");
});


socket.on('candidate',function(data){
    var candidate=data.candidate;
    var user=data.user;
 yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
 log("  candidate recived and candidate is  --> "+data.user );
});
//////////////////////////////////////////////////////////////////////////////////////////

function stop_stream() {
   remove_local_stream(localStream);
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
    join_stream();
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



socket.on('connected',function(data){
 //  alert("heelo");
 init();
    log("congrats you are connected to server");  

});

socket.on('room_created',function(msg){
    var user=user;
    var room=room;

   // handle(user,room);
    log(msg);
});


socket.on('log', function (msg) {
    log(msg);
});




socket.on('user_exit',function(data){     
  log("user "+data.peer+"exited from "+data.room);
});


socket.on('user_leave',function(data){         //function which decide who is going to leave

    if(user==data.peer){
  log("user "+data.peer+"leaved from "+data.room+"created by"+data.creator);
   remove_remote_stream(remoteStream);
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   yourConn.onaddstream = null; 
   
   }

 if(user==data.creator){
  log("user "+data.peer+"leaved from "+data.room+"created by you mr."+data.creator);
 remove_remote_stream(remoteStream); 
   yourConn.onicecandidate = null;
}

else{
    log("user "+data.peer+"leaved the room");
}
});


socket.on('user_exist',function(data){
   
    log("user already exist try some other name");  

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