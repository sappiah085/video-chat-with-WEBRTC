import { domElements } from "./main";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDMZt40bCmmbU0SB-4O_6RWQ00bwrnU8Yg",
  authDomain: "realvideo-b04c4.firebaseapp.com",
  projectId: "realvideo-b04c4",
  storageBucket: "realvideo-b04c4.appspot.com",
  messagingSenderId: "972752084115",
  appId: "1:972752084115:web:15562f43f13ce92e808166",
  measurementId: "G-KM0WZWDRM9",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let localStream = null;
let remoteStream = null;
let server = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};
let peerConnection = new RTCPeerConnection(server);
export const init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { min: 1024, ideal: 1280, max: 1920 },
      height: { min: 576, ideal: 720, max: 1080 },
    },
    audio: true,
  });
  remoteStream = new MediaStream();
  domElements.you.srcObject = localStream;
  domElements.friend.srcObject = remoteStream;
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
  peerConnection.ontrack = (e) => {
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
  const localstream = localStream;
  domElements.hangup.addEventListener("click", async () => {
    localstream.getTracks().forEach((track) => {
      track.stop();
    });
    peerConnection.close();
    window.location = "/index.html";
  });

  domElements.pause.addEventListener("click", async () => {
    const track = localstream
      .getTracks()
      .find((track) => track.kind == "video");
    if (track.enabled) {
      track.enabled = false;
    } else {
      track.enabled = true;
    }
  });
  domElements.mute.addEventListener("click", async () => {
    const track = localstream
      .getTracks()
      .find((track) => track.kind == "audio");
    if (track.enabled) {
      track.enabled = false;
    } else {
      track.enabled = true;
    }
  });
  const url = window.location.search;
  const urlParams = new URLSearchParams(url);
  let roomID = urlParams.get("roomID");
  if (!roomID.length) {
    const docRef = await addDoc(collection(db, "calls"), {});
    roomID = docRef.id;
    peerConnection.onicecandidate = async (e) => {
      if (e.candidate) {
        await setDoc(doc(db, "calls", roomID), {
          offer: JSON.stringify(peerConnection.localDescription),
        });
      }
    };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
  } else {
    await peerConnection.setRemoteDescription(
      JSON.parse((await getDoc(doc(db, "calls", roomID))).data().offer)
    );
    peerConnection.onicecandidate = async (e) => {
      if (e.candidate) {
        await setDoc(doc(db, "calls", roomID), {
          answer: JSON.stringify(peerConnection.localDescription),
        });
      }
    };
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
  }
  onSnapshot(doc(db, "calls", roomID), async (doc) => {
    if (doc.data().answer && !peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(JSON.parse(doc.data().answer));
    }
  });

  peerConnection.oniceconnectionstatechange = function () {
    if (peerConnection.iceConnectionState == "disconnected") {
      window.location = "/index.html";
    }
  };
  domElements.share.addEventListener("click", async (e) => {
    await navigator.clipboard.writeText(roomID);
    alert("Copied id to clipboard share with friend");
  });
};
