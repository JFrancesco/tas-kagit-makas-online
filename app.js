const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { setTimeout } = require("timers");
const io = new Server(server);

let connectionCount = 0;
const maxConnectionCount = 2;
let player1 = null;
let player2 = null;

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("home");
});

io.on("connection", (socket) => {
    if (connectionCount >= maxConnectionCount) {
        socket.emit("kick")
        socket.disconnect(true);
        return;
    }
    connectionCount++;

    if (player1 == null) {
        player1 = socket;
        console.log("player1 geldi");
        if (player2 != null) {
            player2.emit("enemyhere");
        }

        player1.on("disconnect", () => {
            connectionCount--;
            player1 = null;
            console.log("player1 ayrildi");
            if (player2 != null) {
                player2.emit("msg", "Diğer oyuncu bekleniyor");
                player2.emit("enemynothere");
            }

        });

        if (player2 == null) {
            player1.emit("msg", "Diğer oyuncu bekleniyor");
            player1.emit("enemynothere");
        }
        else {
            player1.emit("msg", "");
            player1.emit("enemyhere");
        }

        player1.on("secilen", (secilen) => {
            player1.secilen = secilen;
            if (player2.secilen == null) {
                player1.emit("msg", "Rakibinin kartını seçmesi bekleniyor.");
                player2.emit("msg", "Rakibin kartını seçti sıra sende.");
            } else {
                player1.emit("msg", "");
                player2.emit("msg", "");
            }
               checkSelections();
        });

    

     

    }
    else if (player2 == null) {
        player2 = socket;
        console.log("player2 geldi");
        if (player1 != null) {
            player1.emit("enemyhere");
        }

        player2.on("disconnect", () => {
            connectionCount--;
            player2 = null;
            console.log("player2 ayrildi");
            if (player1 != null) {
                player1.emit("msg", "Diğer oyuncu bekleniyor");
                player1.emit("enemynothere");
            }

        });

        if (player1 == null) {
            player2.emit("msg", "Diğer oyuncu bekleniyor");
            player2.emit("enemynothere");
        }
        else {
            player2.emit("msg", "");
            player2.emit("enemyhere");
        }


        player2.on("secilen", (secilen) => {
            player2.secilen = secilen;
            if (player1.secilen == null) {
                player2.emit("msg", "Rakibinin kartını seçmesi bekleniyor.");
                player1.emit("msg", "Rakibin kartını seçti sıra sende.");
            }
            else {
                player1.emit("msg", "");
                player2.emit("msg", "");
            }
                     checkSelections();
        });

 


    }



    if (player1 != null && player2 != null) {
        io.emit("msg", "");
        io.emit("start");
    }




    function checkSelections() {
        if (player1?.secilen && player2?.secilen) {
            player1.emit("enemysecilen", player2.secilen);
            player2.emit("enemysecilen", player1.secilen);
        }
    }


       player1.on("startagain",()=>{
        player1.secilen = null;
        player2.secilen = null;
       });

});


server.listen(3000, () => {
    console.log("Server listening");
});