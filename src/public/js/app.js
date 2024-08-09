const socket = new WebSocket(`ws://${window.location.host}`);	// 서버와의 연결


socket.addEventListener("open", () => {	// 서버와 연결 됐을 때 발생하는 이벤트
	console.log("Connected to Server!!!");
});

socket.addEventListener("message", (message) => {	// socket에 send메세지를 받았을 때 발생 
	console.log("Just got this: ", message.data, "from the server");
});

socket.addEventListener("close", () => {	// 서버와 연결이 끊길 시 이벤트 발생(ex 서버 종료)
	console.log("Disconnected from Server!!!");
});

setTimeout(() => {
	socket.send("hello from the browser!!");
}, 1000);


