import * as express from "express";
import {SocketServer} from '../src/socketServer';
var path = require('path');

const app = express();
app.set("port", process.env.PORT || 3000);
const router = express.Router();
var http = require("http").Server(app);

app.use(express.static(path.resolve('./../client/build/')));
console.log(express.static(path.resolve('./../client/build/')))
// login page
router.get("/login", (req: any, res: any) => {
	res.sendFile(path.resolve('./../client/login.html'));
});

router.get("/game", (req: any, res: any) => {
	res.sendFile(path.resolve('./../client/game.html'));
});

router.get("*", (req: any, res: any) => {
	res.redirect("/login");
});

app.use('/', router);

const sockets = new SocketServer(http);
// start our simple server up on localhost:3000


const server = http.listen(3000, function() {
  console.log("listening on *:3000");
});