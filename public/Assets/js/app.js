var AppProcess = (function() {
    var peers_connection = [];
    var remote_vid_stream  = [];
    var peers_connections_ids = [];
    var  remote_aud_stream = [];
    var serverProcess;
    var local_div;
    var audio;
    var isAudioMute = true;
    var rtp_aud_senders =[];
    var video_states ={
        None: 0,
        Camera: 1,
        ScreenShare: 2
    };
    var video_st = video_states.None;
    var videoCamtrack;
    var rtp_vid_senders=[];
   async function _init(SDP_function, my_connid){
        serverProcess = SDP_function;
        my_connection_id = my_connid;
        eventProcess();
        local_div= document.getElementById("localVideoPlayer");
        confirm("Welcome!!!!");
        setTimeout(() => { document.getElementById("micMuteUnmute").click(); }, 1000); 
        document.getElementById("micMuteUnmute").click();
    }
 function eventProcess(){
     $("#micMuteUnmute").on("click", async function() {
         if(!audio){
             await loadAudio();
         }
         if(!audio){
            alert("audio permision has not granted");
            return;
        }
         if(isAudioMute){
             audio.enabled = true;
             $(this).html("<span class='material-icons' style='width: 100%;'>mic</span>");
             updateMediaSenders(audio,rtp_aud_senders);
            
          
         }else{

            audio.enabled =false;
            $(this).html("<span class='material-icons' style='width: 100%;'>mic_off</span>");
            removeMediaSenders(rtp_aud_senders);
         }
         isAudioMute = !isAudioMute;
     });
     
     $("#videoCamOnOff").on("click", async function () {
        if(video_st == video_states.Camera){
            await videoProcess(video_states.None);

        }else{
            await videoProcess(video_states.Camera);
        }
     });
     $("#ShareScreenOnOff").on("click", async function(){
        if(video_st == video_states.ScreenShare){
            await videoProcess(video_states.None);

        }else{
            await videoProcess(video_states.ScreenShare);
        }
     });
    }
    async function loadAudio(){
        try{
          var astream =  await navigator.mediaDevices.getUserMedia({
                video:false,
                audio: {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true
                  },
                
            });
            audio = astream.getAudioTracks()[0];
            audio.enabled = false;
            
        }catch(e){
            console.log(e);
        }
      

    }
    function connection_status(connection){
        if(connection &&
             (connection.connectionState=="new" 
             ||connection.connectionState =="connecting"
             ||connection.connectionState=="connected")){
            return true;
         }else{
             return false;
         }
    }
    async function updateMediaSenders(track, rtp_senders){
        for(var con_id in peers_connections_ids){
            if(connection_status(peers_connection[con_id])){
                if(rtp_senders[con_id] && rtp_senders[con_id].track){
                    rtp_senders[con_id].replaceTrack(track);
                }else{
                    rtp_senders[con_id] = peers_connection[con_id].addTrack(track);
                }
            }
        }
    }

   function removeMediaSenders(rtp_senders){
       for(var con_id in peers_connections_ids){
           if(rtp_senders[con_id] && connection_status(peers_connection[con_id])){
               peers_connection[con_id].removeTrack(rtp_senders[con_id]);
               rtp_senders[con_id]= null;
           }
       }
   }
   function removeVideoStream(rtp_vid_senders){
       if(videoCamtrack){
        videoCamtrack.stop();
        videoCamtrack = null;
        local_div.srcObject = null;
        removeMediaSenders(rtp_vid_senders);
       }
    
   }
async function videoProcess(newVideoState){

    if(newVideoState == video_states.None){

    $("#videoCamOnOff").html("<span class='material-icons' style='width: 100%;'>videocam_off</span>");
    $("#ShareScreenOnOff").html("<span class='material-icons'>present_to_all</span><div>Present Now </div>");
        video_st = newVideoState;
        removeVideoStream(rtp_vid_senders);
    return;
    }
    if(newVideoState == video_states.Camera){
        $("#videoCamOnOff").html("<span class='material-icons' style='width: 100%;'>videocam_on</span>");
     
    }
    
    try{
        var vstream = null;
        if(newVideoState == video_states.Camera){
           vstream = await navigator.mediaDevices.getUserMedia({
                   video:{
                       width: 1920,
                       height: 1080,
                   },
                   audio: false,
            });
        }
        else if (newVideoState == video_states.ScreenShare){
            vstream = await navigator.mediaDevices.getDisplayMedia({
                video:{
                    width: 1920,
                    height: 1080,
                },
                audio: false,
         }); 
         vstream.oninactive = (e) =>{
             removeVideoStream(rtp_vid_senders);
             $("#ShareScreenOnOff").html("<span class='material-icons'>present_to_all</span><div>Present Now </div>");
         }
        }
        if(vstream && vstream.getVideoTracks().length > 0){
            videoCamtrack = vstream.getVideoTracks()[0];
            if(videoCamtrack){
                local_div.srcObject = new MediaStream([videoCamtrack]);
              updateMediaSenders(videoCamtrack,rtp_vid_senders);
            }
        }
    }
    catch(e){
        console.log(e);
        return;
    }
    video_st = newVideoState;
    if(newVideoState == video_states.Camera){
        $("#videoCamOnOff").html("<span class='material-icons' style='width: 100%;'>videocam_on</span>");
        $("#ShareScreenOnOff").html("<span class='material-icons' >present_to_all</span><div> Present Now </div>");
    }else if(newVideoState == video_states.ScreenShare){
        $("#ShareScreenOnOff").html("<span class='material-icons text-success' >present_to_all</span><div class='text-success'>Stop Presenting </div>");
        $("#videoCamOnOff").html("<span class='material-icons' style='width: 100%;'>videocam_off</span>");

    
    }

}


     var iceConfiguration = {
         iceServers:[
             {
                 urls: "stun:stun.l.google.com:19302",
             },
             {
                urls: "stun:stun1.l.google.com:19302",
             },
             {url:'stun:stun01.sipphone.com'},
             {url:'stun:stun.ekiga.net'},
             {url:'stun:stun.fwdnet.net'},
             {url:'stun:stun.ideasip.com'},
             {url:'stun:stun.iptel.org'},
             {url:'stun:stun.rixtelecom.se'},
             {url:'stun:stun.schlund.de'},
             {url:'stun:stun.l.google.com:19302'},
             {url:'stun:stun1.l.google.com:19302'},
             {url:'stun:stun2.l.google.com:19302'},
             {url:'stun:stun3.l.google.com:19302'},
             {url:'stun:stun4.l.google.com:19302'},
             {url:'stun:stunserver.org'},
             {url:'stun:stun.softjoys.com'},
             {url:'stun:stun.voiparound.com'},
             {url:'stun:stun.voipbuster.com'},
             {url:'stun:stun.voipstunt.com'},
             {url:'stun:stun.voxgratia.org'},
             {url:'stun:stun.xten.com'},
             {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
             },
             {
                url: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
             },
             {
                url: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
             }
            
         ]
     };
    
 async function setConnection(connid){
        var connection = new RTCPeerConnection(iceConfiguration);

        connection.onnegotiationneeded = async function(event){
            await setOffer(connid);
        };
        connection.onicecandidate = function(event){
            if(event.candidate){
                serverProcess(
                    JSON.stringify({ icecandidate: event.candidate }), 
                connid
                );
            }
        };
        connection.ontrack = function(event){
            if(!remote_vid_stream[connid]){
                remote_vid_stream[connid] = new MediaStream();
            }
            if(!remote_aud_stream[connid]){
                remote_aud_stream[connid] = new MediaStream();
            }
            if(event.track.kind == "video"){
                remote_vid_stream[connid]
                .getVideoTracks()
                .forEach((t)=> remote_vid_stream[connid].removeTrack(t));
                remote_vid_stream[connid].addTrack(event.track);
                 var remoteVideoPlayer = document.getElementById("v_"+ connid);
                 remoteVideoPlayer.srcObject = null;
                 remoteVideoPlayer.srcObject = remote_vid_stream[connid];
                 remoteVideoPlayer.load();
            } else if(event.track.kind == "audio"){
                remote_aud_stream[connid]
                .getAudioTracks()
                .forEach((t) =>  remote_aud_stream[connid].removeTrack(t));
                remote_aud_stream[connid].addTrack(event.track);
                 var remoteAudioPlayer = document.getElementById("a_"+connid);
                 remoteAudioPlayer.srcObject = null;
                 remoteAudioPlayer.srcObject = remote_aud_stream[connid];
                 remoteAudioPlayer.load();
            }
        };
        peers_connections_ids[connid] = connid;
        peers_connection[connid] = connection;
        if(video_st == video_states.Camera || 
            video_st == video_states.ScreenShare) {

            if(videoCamtrack) {
            updateMediaSenders(videoCamtrack, rtp_vid_senders);
         }
         }
        return connection;

        
    } 
    async function setOffer(connid){
        var connection = peers_connection[connid];
        var offer =  await connection.createOffer();
         await connection.setLocalDescription(offer);
         serverProcess(
         JSON.stringify({
        offer: connection.localDescription,
    }), 
    connid
    );
}
async  function SDPProcess(message, from_connid){
         message = JSON.parse(message);
         if(message.answer){
            await peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.answer));
         }else if(message.offer){

            if(!peers_connection[from_connid]){
                await setConnection(from_connid);
            }
            await peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.offer));
            var answer = await peers_connection[from_connid].createAnswer();
          await peers_connection[from_connid].setLocalDescription(answer);
          serverProcess(
            JSON.stringify({
           answer: answer,
       }), 
       from_connid
       );
        }else if(message.icecandidate){
            if(!peers_connection[from_connid]){
                await setConnection(from_connid);
            }
            try{
                await peers_connection[from_connid].addIceCandidate(message.icecandidate);
            }catch(e){
                console.log(e);
            }
        }
     }
     async function closeConnection(connid){
         peers_connections_ids[connid]= null;
         if( peers_connection[connid]){
            peers_connection[connid].close();
            peers_connection[connid] = null;
         }
         if(remote_aud_stream[connid]){
            remote_aud_stream[connid].getTracks().forEach((t)=>{
                if(t.stop) t.stop();
            });
            remote_aud_stream[connid] =null;
         }
         if(remote_vid_stream[connid]){
            remote_vid_stream[connid].getTracks().forEach((t)=>{
                if(t.stop)  t.stop();
            });
            remote_vid_stream[connid] =null;
         }
     }
    return {
        setNewConnection: async function(connid){
            await setConnection(connid);
        },
        init: async function(SDP_function, my_connid){
            await _init(SDP_function, my_connid);
        },
        processClientFunc: async function(data, from_connid){
            await SDPProcess(data, from_connid);
            },
        closeConnectionCall: async function(connid){
        await closeConnection(connid);
        },
    }; 
})();
var MyApp = (function() {
    var socket = null;
    var user_id ="";
    var meeting_id ="";

    function init(uid,mid){
      user_id = uid;
      meeting_id = mid;
      $("#meetingContainer").show();
      $("#me h2").text(user_id + "(Me)");
      document.title = user_id;
      event_process_for_signaling_server();
      eventHandeling();
    }
   
    function event_process_for_signaling_server(){
        socket = io.connect();

        var SDP_function = function(data, to_connid){
            socket.emit("SDPProcess", {
                message:data,
                to_connid: to_connid,
            });
        };
        socket.on("connect", () => {
           if(socket.connected){
                AppProcess.init(SDP_function, socket.id)
               if(user_id != "" && meeting_id != ""){
                socket.emit("userconnect", {
                    displayName: user_id,
                    meetingid: meeting_id,
                });
               }
           }
        });
socket.on("inform_other_about_disconnected_user", function(data){
    $("#"+ data.connId).remove();
    $(".participant-count").text(data.uNumber);
    $("#participant_"+ data.connId + "").remove();
    AppProcess.closeConnectionCall(data.connId);
})

        socket.on("inform_others_about_me", function(data){
            addUser(data.other_user_id, data.connId, data.userNumber);
           AppProcess.setNewConnection(data.connId);
        });
        socket.on("inform_me_about_other_user", function(other_users){
            var userNumber = other_users.length;
            var userNumb = userNumber + 1;
            if(other_users){
                for(var i= 0; i < other_users.length; i++){
                    addUser(other_users[i].user_id, other_users[i].connectionId, userNumb);
                    AppProcess.setNewConnection(other_users[i].connectionId);
                }
            }
            
        });
        socket.on("SDPProcess", async function(data){
            await AppProcess.processClientFunc(data.message, data.from_connid);
        });
        socket.on("showChatMessage", function(data){
            var time = new Date();
            var locatime = time.toLocaleString("en-US",{
                hour:"numeric",
                minute: "numeric",
                hour12: true
            });
            var div =$("<div>").html( data.from + " : " +"<span class='font-weight-bold mr-3' style ='color:black;'>" + data.message +"</span>"+ locatime)
            $("#messages").append(div); 
         });
    }
    

   function eventHandeling(){
       $("#btnsend").on("click", function() {
           var msgData = $("#msgbox").val();
        socket.emit("sendMessage", msgData);
        var time = new Date();
        var locatime = time.toLocaleString("en-US",{
            hour:"numeric",
            minute: "numeric",
            hour12: true
        });
        var div =$("<div>").html( user_id + "(Me)" + " : " +"<span class='font-weight-bold mr-3' style ='color:black;'>" + msgData +"</span>"+ locatime)
        $("#messages").append(div); 

        $("#msgbox").val("");
       });

       var url =window.location.href;
       $(".meeting_url").text(url);
 


       $("#divUsers").on("dblclick", "video", function(){
        this.requestFullscreen();
        });
   }



function addUser(other_user_id, connId, userNum) {
  var newDivId = $("#otherTemplate").clone();
  newDivId = newDivId.attr("id", connId).addClass("other");
  newDivId.find("h2").text(other_user_id);
  newDivId.find("video").attr("id", "v_"+ connId);
  newDivId.find("audio").attr("id", "a_"+ connId);
  newDivId.show();
  $("#divUsers").append(newDivId);
  $(".in-call-wrap-up").append(' <div class="in-call-wrap d-flex justify-content-between align-items-center mb-3" id ="participant_'+connId+'"> <div class="participant-img-name-wrap display-center cursor-pointer"> <div class="participant-img"> <img src="public/Assets/images/other.jpg" alt="" class="border border-secondary" style="height: 40px; width: 40px; border-radius: 50%;"> </div> <div class="participant-img-name ml-2">'+ other_user_id +'</div> </div> <div class="participant-action-wrap display-center"> <div class="participant-action-dot display-center mr-2 cursor-pointer"> <span class="material-icons">more_vert</span> </div> <div class="participant-action-dot display-center mr-2 cursor-pointer"> <span class="material-icons">push_pin</span> </div> </div> </div>');
  $(".participant-count").text(userNum);
 
}

$(document).on("click", ".people-heading", function(){
    $(".chat-show-wrap").hide(300);
    $(".in-call-wrap-up").show(300);
    $(this).addClass("active");
    $(".chat-heading").removeClass("active");

});
$(document).on("click", ".chat-heading", function(){
    $(".chat-show-wrap").show(300);
    $(".in-call-wrap-up").hide(300);
    $(this).addClass("active");
    $(".people-heading").removeClass("active");

});
$(document).on("click", ".meeting-heading-cross", function(){
  $(".g-right-details-wrap").hide(300);

});
$(document).on("click", ".top-left-participant-wrap", function(){
    $(".g-right-details-wrap").show(300);
    $(".in-call-wrap-up").show(300);
    $(".chat-show-wrap").hide(300);
  
  });
  $(document).on("click", ".top-left-chat-wrap", function(){
    $(".g-right-details-wrap").show(300);
    $(".in-call-wrap-up").hide(300);
    $(".chat-show-wrap").show(300);
  
  });
  $(document).on("click", ".g-bottom", function(){
    $("#meetings").show(300);
  });


  $(document).on("click", ".end-call-wrap", function(){
$(".top-box-show").css({
    "display": "block",
}).html('<div class="top-box align-vertical-middle profile-dialogue-show"> <h3 class="mt-2" style="color:white; text-align: center;">Leave Meeting</h3> <hr> <div class="call-leave-cancel-action d-flex justify-content-center align-items-center w-100"> <a href="/action.html"><button class="leave-action btn btn-danger mr-5"> Leave </button></a> <button class="call-cancel-action btn btn-secondary">Cancel</button> </div></div>');
  });
  $(document).mouseup(function(e){
 var container = new Array();
 container.push($(".top-box-show"));
 $.each(container, function(key, value){
     if(!$(value).is(e.target)&& $(value).has(e.target).length == 0){
        $(value).empty();
     }
 });
  });
  $(document).on("click", ".call-cancel-action", function(){
    $(".top-box-show").html('');
  });

  $(document).on("click", ".copy_info", function(){
    var $temp = $("<input>");
    $("body").append("$temp");
    $temp.val($(".meeting_url").text()).select();
    document.execCommand("copy");
    $temp.remove();
    $(".link-conformation").show();
    setTimeout(function(){
        $(".link-conformation").hide();
    },3000);

  });
        return{
            _init: function (uid, mid){
                init(uid, mid) ;
            },
        };
})();