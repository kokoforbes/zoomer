const socket = io("/");
const videoGrid = document.getElementById("video-grid");

// initiate peer connection on port 3001
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // set up connection with new user
    socket.on("user-connected", (userId) => {
      connectToNEwUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

// add add video stream and plays on load
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

function connectToNEwUser(userId, stream) {
  const video = document.createElement("video");
  const call = myPeer.call(userId, stream);
  call.on("stream", (video, userVideoStream) => {
    addVideoStream(userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}
