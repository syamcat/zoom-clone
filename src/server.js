import express from "express";


const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); // /src 가 root로 되어있음

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
const handleListen = () => console.log(`Listening on http://localhost:3000`) // console.log를 찍는 함수를 저장

app.listen(3000, handleListen); 