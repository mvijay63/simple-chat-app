const express = require("express")
const http = require("http")
const path = require("path")
const socketio = require("socket.io")
const Filter = require("bad-words")
const { generateMessage } = require("./utils/message")
const {addUser , removeUser, getUser, getUsersInRoom} = require("./utils/users")

const port = process.env.PORT || 3000 

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDir = path.join(__dirname , "../public")

app.use(express.static(publicDir))

let count = 0

io.on('connection' , (socket) => {
    console.log('Web socket is working')
    
    socket.on('join', ({username , room}, callback) => {
        const {error, user} = addUser({id:socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message' , generateMessage( 'Admin' ,  'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin' , `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendMessage', (message , callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Something wrong with message')
        }
        io.to(user.room).emit('message' , generateMessage(user.username , message))
        callback()
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message' , generateMessage('Admin' , `${user.username} left`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})



server.listen(port , () => {
    console.log("working")
})