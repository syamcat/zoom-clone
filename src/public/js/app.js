const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);	// 서버와의 연결


function makeMessage(type, payload) {
	const message = {type, payload};
	return JSON.stringify(message);
}

socket.addEventListener("open", () => {	// 서버와 연결 됐을 때 발생하는 이벤트
	console.log("Connected to Server!!!");
});

socket.addEventListener("message", (message) => {	// socket에 send메세지를 받았을 때 발생 
	console.log("Just got this: ", message.data);
	const li = document.createElement("li");
	li.innerText = message.data;
	messageList.append(li);
});

socket.addEventListener("close", () => {	// 서버와 연결이 끊길 시 이벤트 발생(ex 서버 종료)
	console.log("Disconnected from Server!!!");
});


function handleSubmit(event) {
	event.preventDefault();
	const input = messageForm.querySelector("input");
	// console.log(input.value);	// 브라우저 콘솔에 입력값 출력
	socket.send(makeMessage("new_message", input.value));	// 서버에 입력값 전송
	input.value = "";	// 사용 끝난 value 초기화
	
}

function handleNickSubmit(event) {
	event.preventDefault();
	const input = nickForm.querySelector("input");
	socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

// setTimeout(() => { // 10초가 지나고 실행
// 	socket.send("hello from the browser!!");  이 메세지를 소켓으로 보냄
// }, 10000);


