import * as http from "http";
import {Router} from "./Router";

const port = process.env.port || 1337;

//const router = new Router();

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);