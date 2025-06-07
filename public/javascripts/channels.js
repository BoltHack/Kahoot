function sendMessage() {
    const message = document.getElementById('message');
    if (message.value.length > 0) {
        socket.emit('sendMessage', {
            channelId: channelId,
            id: sendId,
            name: sendName,
            companionId: companionId,
            message: message.value
        });
        message.value = '';
    }
}
const input = document.getElementById('message');

input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

function scrollToBottom() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

window.addEventListener('load', () => {
    scrollToBottom();
    checkOnline();
});

socket.on('showMessages', async (showMessagesData) => {
    const messages = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.innerHTML = `
        <div class="message" data-id="${showMessagesData._id}" id="message-${showMessagesData._id}" onmouseover="showTools({msgId: '${showMessagesData._id}', myId: '${showMessagesData.id}'});">
            <img class="avatar" src="${showMessagesData.image}">
            <div class="message-content">
                <div class="message-header">
                    <span class="username">${showMessagesData.name}</span>
                    <span class="timestamp">${ (() => {
        const d = new Date(showMessagesData.date);
        const now = new Date();

        const isSameDay = (d1, d2) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        if (isSameDay(d, now)) {
            return localeType === 'en' ?
                'Today, ' + d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})
                : 
                'Сегодня, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else if (isSameDay(d, yesterday)) {
            return localeType === 'en' ? 
                'Yesterday, ' + d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})
                : 
                'Вчера, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else {
            return localeType === 'en' ?
                d.toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
                :
                d.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
        }
    })() }</span>
                </div>
                <div class="text">${showMessagesData.message}</div>
            </div>
            
            <div class="tools" onclick="openToolsMenu('${showMessagesData._id}')" id="tools-${showMessagesData._id}">
                <div class="menu-trigger">⋯</div>
                    <div class="dropdown-menu">
                        <button style="color: #cc0000" onclick="socket.emit('deleteMsg', { channelId: channelId, msgId: '${showMessagesData._id}'})">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
                    </div>
                </div>
            </div>`
    messages.appendChild(newMessage);
    scrollToBottom();
});

function showTools(msgData) {
    if (msgData.myId === sendId) {
        const message = document.getElementById('message-'+msgData.msgId);
        const toolsId = document.getElementById('tools-'+msgData.msgId);

        toolsId.style.display = 'inline-block';

        message.addEventListener('mouseout', () => {
            if (toolsId.querySelector('.dropdown-menu').style.display === 'flex') {
                message.style.backgroundColor = '#212429';
                toolsId.style.display = 'inline-block';
                toolsId.querySelector('.menu-trigger').style.backgroundColor = '#2a2f37';
            }
            else {
                message.style.backgroundColor = '';
                toolsId.style.display = 'none';
                toolsId.querySelector('.menu-trigger').style.backgroundColor = '';
            }
        });
    }
}
function openToolsMenu(msgId) {
    const message = document.getElementById('message-'+msgId);
    const toolsId = document.getElementById('tools-'+msgId);
    const dropdownMenu = toolsId.querySelector('.dropdown-menu');

    if (dropdownMenu.style.display === 'flex') {
        dropdownMenu.style.display = 'none';
        message.style.backgroundColor = '';
        toolsId.style.display = 'none';
        toolsId.querySelector('.menu-trigger').style.backgroundColor = '';
    } else {
        setTimeout(function () {
            toolsId.style.display = 'inline-block';
            dropdownMenu.style.display = 'flex';
        }, 100);
    }

    message.addEventListener('click', () => {
        setTimeout(() => toolsId.style.display = 'inline-block', 1);
    });

    document.addEventListener('click', () => {
        toolsId.querySelector('.dropdown-menu').style.display = 'none';
        message.style.backgroundColor = '';
        toolsId.style.display = 'none';
        toolsId.querySelector('.menu-trigger').style.backgroundColor = '';
    })

}
setInterval(function () {
    checkOnline();
}, 10000);

function checkOnline() {
    socket.emit('checkOnline', {
        sendId,
        channelId
    });
}

socket.on('onlineMod', async (data) => {
    console.log('userOnline', data.userOnline);
    document.getElementById('onlineMod').innerText =
        data.userOnline === 'Online' ? localeType === 'en' ? 'Online' :
            'В сети' : localeType === 'en' ? 'Offline' : 'Не в сети';
});

if (window.location.pathname.startsWith('/channels/')) {
    socket.emit('joinRoom', channelId);
}
else {
    socket.emit('leaveRoom', channelId);
}
socket.on('deleteMessage', async (deleteMessage) => {
    console.log('deleteMessage', deleteMessage);
    const messages = document.getElementById('messages');
    const oldMessage = document.getElementById('message-'+deleteMessage.msgId);
    if (oldMessage && oldMessage.parentNode) {
        oldMessage.parentNode.removeChild(oldMessage);
    }
    else {
        messages.removeChild(oldMessage);
    }
    scrollToBottom();
});

socket.on('broadcastDeleteMsg', async () => {
    Swal.fire({
        text: localeType === 'en' ? 'message deleted!' : 'Сообщение удалено!',
        icon: "success",
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
});