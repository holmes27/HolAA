const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
const peers={}

/*Here I have added the functionality to 
change the UI when user taps on back button*/
backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

/*Here I have added the functionality to 
change the UI when user taps on showChat button*/

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

/*Here I am storing the user's name in local storage*/
let user = localStorage.getItem('name');

/*Here I am redirecting the user to the home page if the name 
is not stored in local database*/
if (!user) {
  window.location.href = "/"

}



var peer = new Peer(); //creating a Peer object to send a receive connections.

/*Here I'm getting the video stream i.e. user media, 
and then adding that stream to a video element.*/
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    console.log(peers);
    console.log("disconnect me peer")
  });


function connectToNewUser (userId, stream)  {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove()
    console.log(peers);
    console.log("close me peer")
  })

  peers[userId] = call
  console.log(peers);
  console.log(" me peer")
};

//Assigning peer object a random, unique ID and also the user's name.
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

/*Created a addVideoStream function which adds the stream to the video element.*/

function addVideoStream (video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

/*Created a function which fetches the current time in 12hour format*/
function currentTime() {
  var date = new Date(); /* creating object of Date class */
  var hour = date.getHours();
  var min = date.getMinutes();

  function updateTime(k) {
    if (k < 10) {
      return "0" + k;
    }
    else {
      return k;
    }
  }

  hour = updateTime(hour);
  min = updateTime(min);

  var ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'


  document.getElementById("clock").innerText = hour + " : " + min + " " + ampm; /* adding time to the div */
  var t = setTimeout(function () { currentTime() }, 1000); /* setting timer */
}

currentTime();

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

/*created a function which sends the 
message when user taps on send button */

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

/*created a function which sends the 
message when user presses the enter key */

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

/*created a function which turns off the 
mic of the user when user taps on mute button */

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<button class="icon" title="Turn on mic"><span class="material-icons">mic_off</span></button>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<button class="icon" title="Turn off mic"><span class="material-icons">mic</span></button>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

/*created a function which turns off the 
video of the user when user taps on turnoff video button */

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<button class="icon" title="Turn on video"><span class="material-icons">videocam_off</span></button>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<button class="icon" title="Turn off video"><span class="material-icons">videocam</span></button>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

/*created a function which disconnects the user 
and redirects the user to homepage when endcall button is pressed*/
endCall.addEventListener("click", (e) => {
  localStorage.clear();
  window.location.href = "/"
});

// var pageUrl = window.location.href;

/*created a function for inviting another user 
 to the call, a prompt appears from there the user can copy and send the invite link*/

inviteButton.addEventListener("click", (e) => {

  // Qual.icon( pageUrl.split("/")[3],'Copy and send the above RoomID to invite', 'icon.svg');
  Qual.icon(window.location.href, 'Copy the above link to invite', 'icon.svg');
});


socket.on("createMessage", (message, userName) => {

  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b>
         
        <span> ${userName === user ? "You" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;

});
