const socket = io();
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;

function addMessage(message) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li);
}

function handleMessageSubmit(event) {
	event.preventDefault();
	const input = room.querySelector("#msg input");	// msg form에서 input요소 가져오기
	const value = input.value;	// 시작시 미리 저장해두는 이 명령줄이 없다면
	socket.emit("new_message", input.value, roomName, () => {
		addMessage(`You: ${value}`);
	});
	input.value = "";	// 명령문이 순서대로 실행되지 않기 때문에 addMessage(`You: 이부분이 출력 안됨`)
}

function handleNicknameSubmit(event) {
	event.preventDefault();
	const input = room.querySelector("#name input");	// name form에서 input요소 가져오기
	const value = input.value;	// 시작시 미리 저장해두는 이 명령줄이 없다면
	socket.emit("nickname", input.value);
	input.value = "";	// 명령문이 순서대로 실행되지 않기 때문에 addMessage(`You: 이부분이 출력 안됨`)
}

function showRoom() {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName}`;
	const msgForm = room.querySelector("#msg");
	const nameForm = room.querySelector("#name");
	msgForm.addEventListener("submit", handleMessageSubmit);
	nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
	event.preventDefault();
	const input = form.querySelector("input");	// input 태그 정보 가져옴
	/* enter_room 이라는 event 이름에 {payload: input태그의 value값} 객체를 담아서 전송 */
	// socket.emit("enter_room", { payload: input.value });

	// socket.io를 이용하면 text외에 다른 형식도 보낼 수 있다.
	/* socket.emit(eventName, param1, param2, ..., function); 이런 형태로 작성 */
	socket.emit("enter_room", { payload: input.value },
		// 함수도 전송 가능
		// 서버에서 실행하면 프론트에서 작동한다!!!
		showRoom
	);
	roomName = input.value;
	input.value = "";	// 입력값 초기화
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
	addMessage(`${user} joined!`);
});

socket.on("bye", (left) => {
	addMessage(`${left} left`);
});

socket.on("new_message", addMessage);