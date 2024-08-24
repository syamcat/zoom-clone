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
	console.log(socket);	// socket을 콘솔에 출력
})


httpServer.listen(3000, handleListen);	// 3000번 포트 이벤트 리스너 생성