const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get username and room from url
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const socket = io()

//join room
socket.emit('joinRoom',{username,room})

//get room and users
socket.on('roomUsers',({room,users})=>{
    RoomName(room);
    UsersList(users);
})

//message from server 
socket.on('message',message => {
    outputMessage(message)
    //scroll chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener('submit',(e)=> {
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage',msg)

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus()
}) 

//output message to dom
function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p> 
    <p class="text"> ${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div)
}

//Add room to dom
function RoomName(room){
    roomName.innerText = room;
}

//add users to dom
function UsersList(users){
    userList.innerHTML = `${users.map(user=> `<li> ${user.username} </li>`).join('')}`
}
