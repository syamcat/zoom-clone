import express from "express";
import WebSocket from "ws";
import http from "http";
import { Collection } from "mongoose";


const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); // /src 가 root로 되어있음
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on ws://localhost:3000`); // console.log를 찍는 함수를 저장

// app.listen(3000, handleListen); //3000번 포트로 이벤트 리스너 열기, listen(포트번호, 이벤트 처리 함수)

const server = http.createServer(app);	// http 서버 생성

const wss = new WebSocket.Server({ server });	// 웹 소켓 서버 생성, Server( http server ) 같은 서버(포트)에서 websocket, http 실행

// function handleConnection(socket) {
// 	console.log(socket)	// 소켓은 메모리 주소 같은 느낌(연결된 브라우저)
// }

const sockets = [];

wss.on("connection", (socket) => {	// 웹소켓으로 접속이 발생하면 실행 *이 명령어로 접속이 발생하는게 아니다.
	// console.log(socket);
	sockets.push(socket);	// socket의 정보를 리스트에 저장
	socket["nickname"] = "Anon";
	console.log("Connected to Browser!!!");
	socket.on("close", () => { 
			console.log("Disconnected from Browser");
			// sockets.pop(socket);
		});	// client 접속 종료시 발생
	// socket.on("message", (message) => console.log(message.toString()));	// client 한테 받은 메세지를 터미널에 출력
	socket.on("message", (message) => {
		const msg = JSON.parse(message);	// 받은 JSON을 javascript 객체로 파싱
		console.log(msg)

		switch(msg.type) {
			case "new_message":
				sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${msg.payload}`));	// message에 담겼던 payload키의 value값 전송

			case "nickname":
				socket["nickname"] = message.payload;
		}
	});
	// socket.send("hello");
});	// 유저가 연결되는 이벤트 처리

server.listen(3000, handleListen);	// 3000번 포트 이벤트 리스너 생성