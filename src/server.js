import express from "express";
import { Server } from "socket.io"
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

const app = express();

// const sslCertFile = process.env.SSL_CRT_FILE || "cert/localhost.pem";
// const sslKeyFile = process.env.SSL_KEY_FILE || "cert/localhost-key.pem";

// const certPath = path.resolve(__dirname + "cert/localhost+2.pem")
// const keyPath = path.resolve(__dirname, "cert/localhost+2-key.pem")


const sslOptions = {
	key: fs.readFileSync(__dirname + "/../cert/localhost+2-key.pem", "utf-8"),
	cert: fs.readFileSync(__dirname + "/../cert/localhost+2.pem", "utf-8")
}

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); // /src 가 root로 되어있음
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on ws://localhost:3000`); // console.log를 찍는 함수를 저장

// app.listen(3000, handleListen); //3000번 포트로 이벤트 리스너 열기, listen(포트번호, 이벤트 처리 함수)

const httpServer = https.createServer(sslOptions, app);	// http 서버 생성
const wsServer = new Server(httpServer);	// Socket.io 서버 생성

wsServer.on("connection", socket => {
	// 들어오는 모든 이벤트를 출력해준다.
	socket.onAny((event) => {
		console.log(wsServer.sockets.adapter); // adapter: 서버간의 실시간 동기화를 위해 사용
		console.log(`Socket Event:${event}`);
	});

	socket.on("join_room", (roomName) => {
		console.log("here is join_room(roomName):", roomName);
		socket.join(roomName);
		// console.log("here is join_room(startMedia):", startMedia); 
		socket.to(roomName).emit("welcome"); 
	});
	// offer보내는 쪽의 리스너
	socket.on("offer", (offer, roomName) => {
		socket.to(roomName).emit("offer", offer);
	});
	// answer받는 리스너
	socket.on("answer", (answer, roomName) => {
		socket.to(roomName).emit("answer", answer);
	});

	socket.on("ice", (ice, roomName) => {
		socket.to(roomName).emit("ice", ice);
	});
});

httpServer.listen(3000, handleListen);	// 3000번 포트 이벤트 리스너 생성
