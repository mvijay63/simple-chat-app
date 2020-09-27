const socket = io()
//elemets 
const $messageForm = document.querySelector("#message-form")
const $input = $messageForm.querySelector("input")
const $button = $messageForm.querySelector("button")
const $messages = document.querySelector("#messages")
const $sidebar = document.querySelector("#sidebar")
//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
//Options 

const { username , room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscoll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containterHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containterHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate , {
        name : message.name,
        message : message.text , 
        time : moment(message.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscoll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $button.setAttribute('disabled', 'disabled')
    const message = $input.value 
    socket.emit('sendMessage', message , (error) => {
        $button.removeAttribute('disabled')
        $input.value = ''
        $input.focus()
        if(error){
            return console.log(error)
        }
    })
})

socket.emit('join', {username , room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room , users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    $sidebar.innerHTML = html
})