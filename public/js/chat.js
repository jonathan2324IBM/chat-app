const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild
    
    //get height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    //scrollHeight- how much we can scroll
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    //value gets larger as you scroll down
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    
}

//General chat messages Event handler
socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

//Location message Event handler
socket.on('locationMessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

//
socket.on('roomData', ({ room, users}) => {
    //console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //This disables the form once it has been submitted
    $messageFormButton.setAttribute('disabled', 'disabeled')

    //target is the form element
    //then we can access the elements properties and we can access any inputs by their name
    //we picked the name to be message so that is how we get the value
    const message = e.target.elements.message.value
    //console.log(messageData)

    //callback runs when the event is acknowledged
    socket.emit('sendMessage', message, (error) => {

       

        //re-enable form
        $messageFormButton.removeAttribute('disabled')

        //clear form
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        } 
        console.log('Message delivered')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    //Disable share location button
    $sendLocationButton.setAttribute('disabled', 'disabled')


    //does not support promises
    //position is an object
    navigator.geolocation.getCurrentPosition((position) => {
       

        socket.emit('sendLocation', { 
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            //re-enable the shar location button
            $sendLocationButton.removeAttribute('disabled')

            console.log(`Client: Location delivered. Server: ${message}`)



        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href="/"
    }
})