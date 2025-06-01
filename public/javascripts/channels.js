function sendMessage() {
    const message = document.getElementById('message');
    console.log('message', message.value);
    if (message.value.length > 0) {
        socket.emit('sendMessage', {
            channelId: channelId,
            id: sendId,
            name: sendName,
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
    console.log('showMessagesData', showMessagesData);
    const messages = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.innerHTML = `
        <div class="message">
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
            return 'Сегодня, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else if (isSameDay(d, yesterday)) {
            return 'Вчера, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else {
            return d.toLocaleString('ru-RU', {
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
        </div>`
    messages.appendChild(newMessage);
    scrollToBottom();
});

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