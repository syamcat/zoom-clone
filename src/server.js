import express from "express";
import { Server } from "socket.io"
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

const httpServer = http.createServer(app);	// http 서버 생성
const wsServer = new Server(httpServer);	// Socket.io 서버 생성

// connection 감지
wsServer.on("connection", socket => {
	socket.onAny((event) => {
		console.log(`Socket Event:${event}`);
	});
	/* enter_room이라는 event수신 socket.on(event이름, (인자1, 인자2, ...) => {실행내용} ) */
	socket.on("enter_room", (roomName, backendDone) => {
		console.log(socket.id);	// Client의 id
		console.log(socket.rooms);	// socket.rooms: socket이 참여중인 room 출력
		socket.join(roomName.payload);	// room에 참가 / socket.leave(roomName)로  나가는 것도 가능
		console.log(socket.rooms);
		backendDone();
		// socket.to()라는 함수도 있다.
		socket.to(roomName.payload).emit("welcome");	// 해당 room의 모든 사람에게 이벤트 보냄

		// backend에서 실행시키지만 실행은 Frontend에서 진행된다!
		// backendDone("backend is done");	// Front 함수에 메세지를 담아서 실행
	});
})


httpServer.listen(3000, handleListen);	// 3000번 포트 이벤트 리스너 생성