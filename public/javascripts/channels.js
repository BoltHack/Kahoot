function sendMessage() {
    const chatReply = document.querySelector('.chat-reply');
    const message = document.getElementById('message');
    const messages = document.querySelectorAll('.message');

    const replyId = chatReply ? chatReply.getAttribute('data-id') : null;

    const chatInput = document.getElementById('chatInput');
    const allReply = chatInput.querySelectorAll('.chat-reply');

    if (message.value.length > 0) {
        socket.emit('sendMessage', {
            channelId: channelId,
            id: sendId,
            name: sendName,
            companionId: companionId,
            message: message.value,
            replyId: replyId
        });
        message.value = '';
        message.focus();
        allReply.forEach(reply => {
            reply.remove();
        });
        messages.forEach(msg => {
            msg.classList.remove('reply-message');
        });
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
    checkPageHeight();
}

window.addEventListener('load', () => {
    scrollToBottom();
    checkOnline();
});

socket.on('showMessages', async (showMessagesData) => {
    const messages = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.innerHTML = `
        <div class="message ${showMessagesData.reply.id ? 'reply' : ''}" data-id="${showMessagesData._id}" id="message-${showMessagesData._id}" onmouseover="showTools({msgId: '${showMessagesData._id}', myId: '${showMessagesData.id}'});">
            <div class="message-container">
                <img class="avatar ${showMessagesData.reply.id ? 'reply-avatarTop' : ''}"" src="${showMessagesData.image}">
            <div class="message-content">
            ${showMessagesData.reply.id ? `
            <a href="#message-${showMessagesData.reply.msgId}" class="reply-container" onclick="findReplyMsg('${showMessagesData.reply.msgId}')">
                <div class="reply-line-wrapper">
                    <div class="reply-line"></div>
                    <img class="reply-avatar" src="${showMessagesData.reply.image}">
                </div>
                <div class="reply-text-container">
                    <div class="reply-header"><strong>${showMessagesData.reply.name}</strong></div>
                <div class="reply-text">${showMessagesData.reply.message.length > 50 ? showMessagesData.reply.message.slice(0, 50) + '...' : showMessagesData.reply.message}</div>
                </div>
            </a>
            ` : ''}
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
                <div class="msg-content">
                    <div class="text" id="msg-${showMessagesData._id}">${showMessagesData.message}</div>
                    <span class="edited-msg" id="edited-${showMessagesData._id}"></span>
                </div>
            </div>
            
            <div class="tools" onclick="openToolsMenu('${showMessagesData._id}')" id="tools-${showMessagesData._id}">
                <div class="menu-trigger">⋯</div>
                    <div class="dropdown-menu">
                        <button onclick="msgReplyMenu('${showMessagesData._id}', '${showMessagesData.name}')">${localeType === 'en' ? 'Reply' : 'Ответить'}</button>
                        <button onclick="msgRedactionMenu('${showMessagesData._id}')">${localeType === 'en' ? 'Edit' : 'Редактировать'}</button>
                        <div class="tools-line"></div>
                        <button style="color: #cc0000" onclick="socket.emit('deleteMsg', { channelId: channelId, msgId: '${showMessagesData._id}'})">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
                    </div>
                </div>
            </div>
        </div>`
    messages.appendChild(newMessage);
    scrollToBottom();
});

function showTools(msgData) {
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


function checkPageHeight() {
    const messagesDiv = document.getElementById('messages');
    const positionWarning = document.getElementById('positionWarning');
    const messageDivScroll = messagesDiv.scrollTop;
    messagesDiv.addEventListener('scroll', function() {
        if (Math.floor(messagesDiv.scrollTop) + 10000 < Math.floor(messageDivScroll)) {
            positionWarning.style.display = 'flex';
            positionWarning.classList.add('show');
        }
        else {
            positionWarning.style.display = 'none';
            positionWarning.classList.remove('show');
        }
    })
}
function msgRedactionMenu(msgId) {
    const message = document.getElementById('msg-'+msgId);
    const editInput = document.createElement('textarea');

    editInput.value = message.textContent;
    editInput.id = 'msg-' + msgId;
    editInput.className = 'edit-input';

    console.log('message-content', message.offsetWidth)

    const text = document.querySelectorAll('.edit-input');
    text.forEach(menu => {
        const originalText = menu.value;
        const div = document.createElement('div');
        div.id = menu.id;
        div.className = 'text';
        div.textContent = originalText;
        menu.replaceWith(div);
    })

    editInput.style.width = `${message.clientWidth < 500 ? + 500 : message.clientWidth}px`;
    editInput.style.height = `${message.offsetHeight}px`;

    message.replaceWith(editInput);
    editInput.focus();

    editInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const newText = editInput.value.trim();
            if (newText !== '' && newText !== message.textContent) {
                const value = editInput.value;
                console.log('Введённый текст:', value);
                socket.emit('editMsg', {channelId: channelId, msgId: msgId, newMsg: value});
                editInput.replaceWith(message);
            }
        }
        else if (event.key === 'Escape') {
            editInput.replaceWith(message);
        }
    });

    return editInput;
}

socket.on('editedMsg', async (editMsg) => {
    const message = document.getElementById('msg-'+editMsg.msgId);
    const edited = document.getElementById('edited-'+editMsg.msgId);

    message.textContent = editMsg.editMessage;
    edited.textContent = localeType === 'en' ? '(Edited)' : '(Изменено)';
});


function msgReplyMenu(msgId, msgName) {
    const chatInput = document.getElementById('chatInput');
    const allReply = chatInput.querySelectorAll('.chat-reply');
    const chatReply = document.createElement('div');
    const message = document.getElementById('message-'+msgId);
    const messages = document.querySelectorAll('.message');

    messages.forEach(msg => {
        msg.classList.remove('reply-message');
    });
    allReply.forEach(reply => {
        reply.remove();
    });
    message.classList.add('reply-message');

    console.log('msgId', msgId, '|', 'msgName', msgName);

    chatReply.innerHTML = `
        <div class="chat-reply" data-id="${msgId}">
            <span>${localeType === 'en' ? 'Reply ' + msgName : 'Ответить ' + msgName}</span>
            <a id="closeReplyMenu">X</a>
        </div>
`;

    document.getElementById('message').focus();
    chatInput.appendChild(chatReply);

    document.getElementById('closeReplyMenu').addEventListener('click', () => {
        chatReply.remove();
        message.classList.remove('reply-message');
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            chatReply.remove();
            message.classList.remove('reply-message');
        }
    })
}

function findReplyMsg(msgId) {
    const message = document.querySelectorAll('.message');
    const msg = document.getElementById('message-'+msgId);

    message.forEach(msgs => {
        msgs.style.backgroundColor = '';
    })
    setTimeout(() => msg.style.backgroundColor = '#363a53', 100);
}