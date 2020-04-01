const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()

//create server outside of expres library
const server = http.createServer(app)

//socket io expects to be called with raw http server which 
//is why we have to create it on our own
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//only use io.on for connection
io.on('connection', (socket) => {
    console.log('New websocket connection')



    socket.on('join', (options, callback) => {

        const { error, user } = addUser({ id: socket.id, ...options  })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
    
        //broadcast an event goes to everyone but the new user that is joining
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        //to track changes in room
        io.to(user.room).emit('roomData', { 
            room: user.room,
            users: getUsersInRoom(user.room)
         })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)

        if(!user) {
            return callback(error)
        }

        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        //io to sent to all users
        io.to(user.room).emit('message', generateMessage(user.username, message))

        //gets called when the message has been received to the client
        callback('Delivered')
    })

    socket.on('sendLocation',(coords, callback) => {

        const user = getUser(socket.id)

        // if(!user) {
        //     return callback()
        // }

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback('Location received!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }


        
    })



})


server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})