const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(message) {
	console.log(`message: `, message);
}

function handleRoomSubmit(event) {
	event.preventDefault();
	const input = form.querySelector("input");	// input 태그 정보 가져옴
	/* enter_room 이라는 event 이름에 {payload: input태그의 value값} 객체를 담아서 전송 */
	// socket.emit("enter_room", { payload: input.value });

	// socket.io를 이용하면 text외에 다른 형식도 보낼 수 있다.
	socket.emit("enter_room", { payload: input.value},
		// 함수도 전송 가능
		// 서버에서 실행하면 프론트에서 작동한다!!!
		backendDone
	);
	input.value = "";	// 입력값 초기화
}

form.addEventListener("submit", handleRoomSubmit);