const express = require('express')
const http = require('http')
const path = require('path');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
    userJoin, 
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users')

const app = express()
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname,'public')))

const PORT = process.env.PORT || 9000;

const botName = 'Chat Bot ';

// client connect
io.on('connection',socket => {
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room)
        socket.join(user.room);

        //welcome
        socket.emit('message',formatMessage(botName,'Welcome to ChatApp'))
        
        // broadcast when user connects 
        socket.broadcast.to(user.room).emit(
            'message',
            formatMessage(botName,`${user.username} has joined the chat.`))
        
         //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for chatmessages 
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    //on disconnect
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',
            formatMessage(botName,
            `${user.username} has left the chat.`))
            
            //send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }   
    })
})

server.listen(PORT,()=>{
    console.log(`Server Running on port ${PORT}`)
})

