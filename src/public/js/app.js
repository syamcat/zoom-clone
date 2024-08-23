const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");	// id가 message인 것과 연결
const nickForm = document.querySelector("#nick");		// id가 nick인 것과 연결
const socket = new WebSocket(`ws://${window.location.host}`);	// 서버와의 연결

// (서버로)전송할 메세지를 만드는 함수
function makeMessage(type, payload) {
	const message = {type, payload};	// stringify 함수에 넣을 객체를 생성
	return JSON.stringify(message);	// JSON형식을 문자열로 만들어주는 함수
}

// 서버와 연결 됐을 때 발생하는 이벤트
socket.addEventListener("open", () => {
	console.log("Connected to Server!!!");
});

// socket에 send메세지를 받았을 때 발생하는 함수
socket.addEventListener("message", (message) => {
	console.log("Just got this: ", message.data);
	const li = document.createElement("li");
	li.innerText = message.data;
	messageList.append(li);
});

// 서버와 연결이 끊길 시 이벤트 발생(ex 서버 종료)
socket.addEventListener("close", () => {
	console.log("Disconnected from Server!!!");
});

// 서버에 무언가를 전송하는 이벤트를 다루는 함수
function handleSubmit(event) {
	event.preventDefault();
	const input = messageForm.querySelector("input");
	// console.log(input.value);	// 브라우저 콘솔에 입력값 출력
	socket.send(makeMessage("new_message", input.value));	// 서버에 입력값 전송
	const li = document.createElement("li");
	li.innerText = `You: ${input.value}`;
	messageList.append(li);
	input.value = "";	// 사용 끝난 value 초기화
	
}

// 닉네임을 정하는 이벤트를 다루는 함수
function handleNickSubmit(event) {
	event.preventDefault();
	const input = nickForm.querySelector("input");
	socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);	// home.pug의 message입력 폼에 submit 이벤트 발생
nickForm.addEventListener("submit", handleNickSubmit);	// home.pug의 nick입력 폼에서 submit 이벤트 발생 

// setTimeout(() => { // 10초가 지나고 실행
// 	socket.send("hello from the browser!!");  이 메세지를 소켓으로 보냄
// }, 10000);


