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
	// 비디오 입력들 토글하는 스위치, track.enable은 boolean으로 true/false로 되어있다.
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
	if (myPeerConnection) {	// 나에게 연결된 외부입력 목록이 있는 경우
		const videoTrack = myStream.getVideoTracks()[0];	// 내 스트림 중 videoTrack을 가져옴
		// senders: peer에서 전달받은 video, audio track list
		// console.log(myPeerConnection.getSenders());
		const videoSender = myPeerConnection	// 비디오를 전송할 video Sender 객체를 찾아옴
			.getSenders()
			.find(sender => sender.track.kind === "video");
		// video sender로 track교체 함수를 호출(인자는 video track)
		videoSender.replaceTrack(videoTrack);
	}
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcom form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
	welcome.hidden = true;
	call.hidden = false;
	await getMedia(); // 비디오 태그에 영상 스트림 입력하는 명령
	makeConnection();	// RTCConnection 생성하는 함수
}

async function handleWelcomeSubmit(event) {
	event.preventDefault();
	const input = welcomeForm.querySelector("input");
	await initCall();
	// emit: 함수를 함수명() 이런식으로 넣으면 안되고 함수명만 넣어야 한다.
	socket.emit("join_room", input.value);
	roomName = input.value;
	input.value = "";
	// console.log(input.value);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

// 
socket.on("welcome", async () => {
	// Session 정보가 담겨있음
	// Offer는 현재 피어의 미디어 설정과 기능(예: 코덱, 전송 옵션 등)에 대한 정보를 포함
	const offer = await myPeerConnection.createOffer();
	myPeerConnection.setLocalDescription(offer);	// 나의 LocalDescription에 Offer정보 저장
	console.log("sent the offer");
	socket.emit("offer", offer, roomName);	// offer 보내는 쪽(처음 접속한 쪽)
});

// 서버에서 offer 들어온 것 받기
socket.on("offer", async (offer) => {
	console.log("received the offer");
	// Connection 중 원격(외부)Description에 offer 저장
	myPeerConnection.setRemoteDescription(offer);
	// 들어온 offer에 대한 answer 생성
	const answer = await myPeerConnection.createAnswer();
	// console.log(answer);	// 생성된 answer 출력
	myPeerConnection.setLocalDescription(answer);	// 나의 LocalDescription에 answer정보 저장
	socket.emit("answer", answer, roomName);
	console.log("sent the answer");
});


// 서버에서 answer 들어온 것 받기
socket.on("answer", answer => {
	console.log("received the answer");
	// 나의 외부입력 정보에 answer 들어온 것을 저장
	myPeerConnection.setRemoteDescription(answer);
});

// 다른 접속자의 정보를 ice 파라미터로 받아온다.
socket.on("ice", (ice) => {
	console.log("received candidate");
	// console.log(ice);
	myPeerConnection.addIceCandidate(ice);
});


// RTC Code
function makeConnection() {
	myPeerConnection = new RTCPeerConnection();	// RTC P2P 연결 생성
	// RTCPeerConnection의 icecandidate 이벤트 리스너는 이미 정의되어 있다. 처리 함수만 만들어서 넣어주면 됨.
	myPeerConnection.addEventListener("icecandidate", handleIce);	// 자신의 icecandidate 정보를 handleIce에 인자로 넘김
	// safari는 addstream지원 안한다. track은 stream이 아니라 streams로 여러 stream을 Array로 반환
	myPeerConnection.addEventListener("track", handleAddStream);
	myStream
		.getTracks()	// 비디오 입력 스트림에서 현재 입력 소스 가져옴
		.forEach((track) => myPeerConnection.addTrack(track, myStream));	// peerConnection에 내 track(input list)와 stream을 담음
	// 상대방은 getSenders() 로 확인 가능하다
}

function handleIce(data) {
	console.log("sent candidate");
	socket.emit("ice", data.candidate, roomName);
}

/* issue safari 작동 안함 */
function handleAddStream(data) {
	const peerFace = document.getElementById("peerFace");
	// console.log("got an stream from my peer");
	// console.log("Peer's stream", data.streams);
	// console.log("this is data", data);
	peerFace.srcObject = data.streams[0];	// 외부 stream을 웹 프론트 비디오 태그로 등록
	// console.log("My stream", myStream);
}