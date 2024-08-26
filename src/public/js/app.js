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

function showRoom() {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName}`;
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

socket.on("welcome", () => {
	addMessage("someone joined!");
});