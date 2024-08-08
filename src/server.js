import express from "express";
import WebSocket from "ws";
import http from "http";


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

wss.on("connection", )

server.listen(3000, handleListen);	// 3000번 포트 이벤트 리스너 생성