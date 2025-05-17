const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');

//deployement
app.use(express.static('build'));
app.use((req,res)=>{

    res.sendFile(path.join(__dirname, 'build', 'index.html'));

})




const io = new Server(server);



const userSocketMap = {
    'dfsasfasfc': 'name'
};


function getAllConnectedClients(roomId) {
    //map
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        };
    });



    // Filter out duplicates based on username
    const uniqueClients = [];
    const seenUsernames = new Set();

    for (const client of clients) {
        if (!seenUsernames.has(client.username)) {
            seenUsernames.add(client.username);
            uniqueClients.push(client);
        }
    }

    return uniqueClients;
}


io.on('connection', (socket) => {
    console.log('socket connected ', socket.id)

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;

        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        console.log('Clients in room before emitting:', clients);

        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        })
    });

//changes
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    })
//sync
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    })

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });

        });
        delete userSocketMap[socket.id];
        socket.leave();

    });
});

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
})