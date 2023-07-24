const express = require('express');
const app= express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

const port= 3000;

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index1.html')
});

const users = {};

io.on('connection',socket=>{
    console.log(socket.id);
    
    socket.on('new-user-joined',name=>{
        users[socket.id] = name;
        socket.broadcast.emit('user-joined',name);
    });


    socket.on('send',message=>{
        socket.broadcast.emit('receive',{message:message,user:users[socket.id]});
    })

    socket.on('typing', () => {
        socket.broadcast.emit('user-typing', users[socket.id]);
      });
    
    socket.on('stop-typing', () => {
        socket.broadcast.emit('user-stop-typing', users[socket.id]);
      });
    
      socket.on('private-message', ({ to, message }) => {
        const recipientSocket = Object.keys(users).find(
          (socketId) => users[socketId] === to
        );
    
        if (recipientSocket) {
          socket.to(recipientSocket).emit('private-message', {
            from: users[socket.id],
            message: message,
          });
        }
      });
       
    socket.on('disconnect',()=>{
        socket.broadcast.emit('left',users[socket.id]);
        delete users[socket.id];
    })
})

server.listen(port,()=>{
    console.log(`server started on port number ${port}`);
}); 