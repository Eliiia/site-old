const http = require('http')
const fs = require("fs")

const conf = require("./config.json")

let dir

if(conf.fulldir == "") dir = __dirname
else dir = conf.fulldir

http.createServer((req, res) => {
    if(req.url.endsWith("/")) req.url += "index.html"

    if(conf.knownIPs.hasOwnProperty(req.socket.remoteAddress)) addr = conf.knownIPs[req.socket.remoteAddress]
    else addr = req.socket.remoteAddress
    console.log(`${addr} ${req.method} ${req.url}`)

    if(req.method == "GET") {
        fs.readFile(dir + conf.dir + req.url, (err,data) => {
            res.setHeader('Content-Type', 'text/html');

            if (err) {
                res.writeHead(404);

                fs.readFile(dir + "/other/404.html", (err,data) => {
                    res.end(data)
                })
                //res.end(JSON.stringify(err))
                return
            }

            res.writeHead(200)
            res.end(data)
        });
    }

    if(req.method == "POST") {
        let body = "";

        req.on("data", (chunk) => {
            body += `${chunk}`
            
            if(body.length > 1e6) res.end() // yes, i know i need a proper way of doing this but whatever
        })

        req.on("end", async () => {
            console.log("\tPOST request finished")

            res.end("thank u.")

            if(req.url == "/ip") { 
                if(conf.knownIPs[req.socket.remoteAddress]) {
                    return console.log("\tlmao")
                }

                let s = body.split("=")
                conf.knownIPs[addr] = s[1]
                fs.writeFileSync("./config.json", JSON.stringify(conf, null, 4))
            }
            else {
                res.writeHead(405);
    
                fs.readFile(dir + "/other/post.html", (err,data) => {
                    res.end(data)
                })
            }
        })
    }
}).listen(conf.port, conf.hostname)