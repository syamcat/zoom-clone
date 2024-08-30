const socket = io();
const myFace = document.getElementById("myFace");	// 비디오 태그
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
	try {
		// 입출력 장치들의 정보를 전부 불러옴
		const devices = await navigator.mediaDevices.enumerateDevices();
		// 불러온 장치들 중 비디오 input 장치들의 정보만 가져옴
		const cameras = devices.filter(device => device.kind === "videoinput");
		const currentCamera = myStream.getVideoTracks()[0];
		// console.log(cameras);
		cameras.forEach(camera => {
			const option = document.createElement("option");	// option 태그 생성
			option.value = camera.deviceId;	// value옵션에는 카메라 id
			option.innerText = camera.label;	// 출력되는 텍스트는 카메라 이름을 넣어준다.
			if (currentCamera.label === camera.label) {	// 현재 촬영중인 카메라와 option에 추가하려는 camera의 label이 같으면
				option.selected = true;	// 옵션에서 선택된 카메라로 보여줌
			}
			camerasSelect.appendChild(option);	//옵션을 Select 태그 사이에 추가
		});
	} catch (e) {
		console.log(e);
	}
}

async function getMedia(deviceId) {
	const initialConstrains = {
		audio: true,
		video: { facingMode: "user" }
	};
	const cameraConstrains = {
		audio: true,
		// exact를 없이 deviceId를 작성하면 deviceId를 못 찾았을 때 다른 카메라로 출력해준다.
		video: { deviceId: { exact: deviceId } },
	}

	try {
		myStream = await navigator.mediaDevices.getUserMedia(	// 디바이스 Input가져옴
			deviceId ? cameraConstrains : initialConstrains	// deviceId 없은 처음 경우 예외처리
		);
		myFace.srcObject = myStream;	// 비디오 플레이어에 영상 스트림 입력
		if (!deviceId) {
			await getCameras();	// 처음에만 카메라 목록 불러오기 + 추가
		}
		// console.log(myStream);
	} catch (e) {
		console.log(e);
	}
};

function handleMuteClick() {
	// getAudioTracks의 속성 값 중에서 enabled(활성화 여부)를 가져와 토글하는 명령
	myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
	if (!muted) {
		muteBtn.innerText = "Unmute";
		muted = true;
	} else {
		muteBtn.innerText = "Mute";
		muted = false;
	}
}

function handleCameraClick() {
	myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
	if (cameraOff) {
		cameraBtn.innerText = "Turn Camera Off";
		cameraOff = false;
	} else {
		cameraBtn.innerText = "Turn Camera On";
		cameraOff = true;
	}
}

async function handleCameraChange() {
	// console.log(cameraSelec.value);
	await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcom form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
	welcome.hidden = true;
	call.hidden = false;
	await getMedia();
	makeConnection();
}

function handleWelcomeSubmit(event) {
	event.preventDefault();
	const input = welcomeForm.querySelector("input");

	// emit: 함수를 함수명() 이런식으로 넣으면  함수명만 넣어야 한다.
	socket.emit("join_room", input.value, startMedia);
	roomName = input.value;
	input.value = "";
	// console.log(input.value);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
socket.on("welcome", async () => {
	// Session 정보가 담겨있음
	const offer = await myPeerConnection.createOffer();
	myPeerConnection.setLocalDescription(offer);
	console.log("sent the offer");
	socket.emit("offer", offer, roomName);
});

socket.on("offer", (offer) => {
	console.log(offer);
});

// RTC Code
function makeConnection() {
	myPeerConnection = new RTCPeerConnection();
	myStream
		.getTracks()
		.forEach((track) => myPeerConnection.addTrack(track, myStream));
}