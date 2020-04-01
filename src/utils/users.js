const users = []


//addUser
const addUser = ({ id, username, room }) => {

    //clean the data
    username = username.trim().toLowerCase()

    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate Username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user

    const user = {
        id, username, room
    }

    users.push(user)
    return { user }
}

//removeUser

const removeUser = (id) => {

    //when item is found, we get the index
    //if no item found, return -1
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1) {

        //returns an array of all removed items
        //then we add [0] to get first position on that array
        return users.splice(index, 1)[0]
    }
}

//getUser

const getUser = (id) => {

    return users.find((user) => {
        return user.id === id
    })

   

}

//getUsersInRoom

const getUsersInRoom = (room) => {

    const updatedUsers = users.filter((user) => user.room === room.trim().toLowerCase() )

    //console.log(updatedUsers)

    return updatedUsers
    
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}