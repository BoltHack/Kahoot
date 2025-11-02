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

function findLastMessage() {
    const hash = window.location.hash;

    if (hash) {
        const msgId = window.location.hash.slice(9);
        document.getElementById('message-' + msgId).scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        history.pushState(null, null, location.href.split('#')[0]);

        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        const totalPageHeight = document.documentElement.scrollHeight;

        if (windowHeight + scrollPosition >= totalPageHeight) {
            setTimeout(() => {
                findReplyMsg(msgId);
            }, 1500);
        }
    } else {
        scrollToBottom();
    }
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    history.pushState(null, null, location.href.split('#')[0]);
    checkPageHeight();
}

window.addEventListener('load', () => {
    scrollToBottom();
    checkOnline();
});

socket.on('showMessages', async (showMessagesData) => {
    const messages = document.getElementById('messages');
    const newMessage = document.createElement('div');

    function linkify(text) {
        const urlPattern = /(\bhttps?:\/\/[^\s<>]+[^\s<>,.?!])/gi;
        return text.replace(urlPattern, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="a-link">${url}</a>`;
        });
    }

    newMessage.innerHTML = `
        <div class="message ${showMessagesData.reply.id ? 'reply' : ''}" data-id="${showMessagesData._id}" id="message-${showMessagesData._id}" onmouseover="showTools({msgId: '${showMessagesData._id}', myId: '${showMessagesData.id}'});">
            <div class="message-container">
                <img class="avatar ${showMessagesData.reply.id ? 'reply-avatarTop' : ''}" src="${showMessagesData.image}">
                <div class="message-content">
                ${showMessagesData.reply.id ? `
                <a href="#message-${showMessagesData.reply.msgId}" class="reply-container" data-msgId="${showMessagesData.reply.msgId}" id="replyContainer-${showMessagesData.reply.msgId}" onclick="findReplyMsg('${showMessagesData.reply.msgId}')">
                    <div class="reply-line-wrapper">
                        <div class="reply-line"></div>
                        <img class="reply-avatar" src="${showMessagesData.reply.image}">
                    </div>
                    <div class="reply-text-container">
                        <div class="reply-header"><strong>${showMessagesData.reply.name}</strong></div>
                        <div class="reply-text">${showMessagesData.reply.message.length > 100 ? showMessagesData.reply.message.slice(0, 100) + '...' : showMessagesData.reply.message}</div>
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
                        <div class="text" id="msg-${showMessagesData._id}">${linkify(showMessagesData.message)}</div>
                        <span class="edited-msg" id="edited-${showMessagesData._id}"></span>
                    </div>
                </div>
                
                <div class="tools" id="tools-${showMessagesData._id}">
                    <div class="tools-settings">
                        <div class="tools-svg">
                        ${showMessagesData.id === sendId ? `
                            <div onclick="msgRedactionMenu('${showMessagesData._id}')">
                                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z" class=""></path></svg>
                            </div>` : ``}
                            <div onclick="msgReplyMenu('${showMessagesData._id}', '${showMessagesData.name}')">
                                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"></path></svg>
                            </div>
                            <div class="menu-trigger" onclick="openToolsMenu('${showMessagesData._id}')">⋯</div>
                        </div>
                    </div>
                    
                        <div class="dropdown-menu">
                        <button onclick="msgReplyMenu('${showMessagesData._id}', '${showMessagesData.name}')">
                            ${localeType === 'en' ? 'Reply' : 'Ответить'}
                            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"></path></svg>
                        </button>
                        ${showMessagesData.id === sendId ? `
                            <button onclick="msgRedactionMenu('${showMessagesData._id}')">
                                ${localeType === 'en' ? 'Edit' : 'Редактировать'}
                                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z" class=""></path></svg>
                            </button>
                            <div class="tools-line"></div>
                            <button style="color: #f47171" onclick="msgDeleteMenu('${channelId}', '${showMessagesData._id}')">
                                ${localeType === 'en' ? 'Delete message' : 'Удалить сообщение'}
                                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z" class=""></path><path fill="currentColor" fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd" class=""></path></svg>
                            </button>` : ``}
                        </div>
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
    if (document.body.offsetWidth > 700) {
        if (message.querySelector('textarea') === null) {
            toolsId.style.display = 'inline-block';
        }

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
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.offsetWidth < 700) {
        document.querySelectorAll('.message').forEach(msg => {
            const msgId = msg.dataset.id;
            msg.querySelector('.tools-settings').style.display = 'none';

            if (!msg.dataset.holdListenerAdded) {
                msg.dataset.holdListenerAdded = "true";

                addHoldListener(msg, 600, () => {
                    setTimeout(() => openToolsMenu(msgId), 100);
                });
            }
        });
    }
});
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

    document.addEventListener('click', (e) => {
        if (!toolsId.contains(e.target)) {
            toolsId.querySelector('.dropdown-menu').style.display = 'none';
            message.style.backgroundColor = '';
            toolsId.style.display = 'none';
            toolsId.querySelector('.menu-trigger').style.backgroundColor = '';
        }
    });
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            toolsId.querySelector('.dropdown-menu').style.display = 'none';
            message.style.backgroundColor = '';
            toolsId.style.display = 'none';
            toolsId.querySelector('.menu-trigger').style.backgroundColor = '';
        });
    });
}

function addHoldListener(element, delay, callback) {
    let holdTimer;

    const startHold = (e) => {
        // e.preventDefault();
        holdTimer = setTimeout(() => callback(e), delay);
    };

    const cancelHold = () => clearTimeout(holdTimer);

    element.addEventListener('mousedown', startHold);
    element.addEventListener('touchstart', startHold);
    element.addEventListener('mouseup', cancelHold);
    element.addEventListener('mouseleave', cancelHold);
    element.addEventListener('touchend', cancelHold);
    element.addEventListener('touchcancel', cancelHold);
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
    const deleteId = deleteMessage.msgId;
    const oldMessage = document.getElementById('message-'+deleteId);

    if (oldMessage && oldMessage.parentNode) {
        oldMessage.parentNode.removeChild(oldMessage);
    }
    else {
        messages.removeChild(oldMessage);
    }

    const replyContainers = document.querySelectorAll('.reply-container');
    replyContainers.forEach(rc => {
        const dataMsgId = rc.getAttribute('data-msgId');
        if (dataMsgId === deleteId) {
            console.log('dataMsgId', dataMsgId);
            rc.href = '#';
            rc.innerHTML = `
                <div class="reply-line-wrapper">
                    <div class="reply-line" style="margin-right: 10px; height: 15px;"></div>
                    <br/>
                </div>
                    <div class="reply-text-container">
                    <div class="reply-text">${localeType === 'en' ? 'Original post removed' : 'Оригинальное сообщение удалено'}</div>
                </div>`
        }
    });
});

socket.on('broadcastDeleteMsg', async () => {
    showToast('success', localeType === 'en' ? 'message deleted!' : 'Сообщение удалено!');
});


function checkPageHeight() {
    const messagesDiv = document.getElementById('messages');
    const positionWarning = document.getElementById('positionWarning');
    const positionWarningMessageBtn = document.getElementById('positionWarningMessageBtn');

    const messageDivScroll = messagesDiv.scrollTop;
    messagesDiv.addEventListener('scroll', function() {
        if (Math.floor(messagesDiv.scrollTop) + 10000 < Math.floor(messageDivScroll)) {
            positionWarning.style.display = 'flex';
            positionWarning.classList.add('show');
            if (window.location.hash) {
                positionWarning.querySelector('span').textContent = localeType === 'en' ? 'You are viewing the answer.' : 'Вы просматриваете ответ.';
                positionWarningMessageBtn.textContent = localeType === 'en' ? 'Go to the original post' :  'Перейти к оригинальному сообщению';
            } else {
                positionWarning.querySelector('span').textContent = localeType === 'en' ? 'You are viewing old messages.' : 'Вы просматриваете старые сообщения.';
                positionWarningMessageBtn.textContent = localeType === 'en' ? 'Go to latest posts' : 'Перейди к последним сообщениям';
            }
        }
        else {
            positionWarning.style.display = 'none';
            positionWarning.classList.remove('show');
        }
    })
}
function msgRedactionMenu(msgId) {
    const message = document.getElementById('msg-'+msgId);
    const messageId = document.getElementById('message-'+msgId);
    const toolsId = document.getElementById('tools-'+msgId);
    const editInput = document.createElement('textarea');

    const messageContainer = messageId.querySelector('.message-container');

    messageId.style.backgroundColor = '#212429';

    if (document.body.offsetWidth > 700) {
        toolsId.style.display = 'none';

        editInput.value = message.textContent;
        editInput.id = 'msg-' + msgId;
        editInput.className = 'edit-input';

        console.log('message-content', message.offsetWidth);

        const text = document.querySelectorAll('.edit-input');
        text.forEach(menu => {
            const originalText = menu.value;
            const div = document.createElement('div');
            div.id = menu.id;
            div.className = 'text';
            div.textContent = originalText;
            menu.replaceWith(div);
        })

        // editInput.style.width = `${message.clientWidth < 500 ? + 500 : message.clientWidth}px`;
        editInput.style.width = `${messageContainer.offsetWidth}px`;
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
                    messageId.style.backgroundColor = '';
                    if (messageId.matches(':hover')) {
                        toolsId.style.display = 'inline-block';
                    }
                }
            }
            else if (event.key === 'Escape') {
                editInput.replaceWith(message);
                messageId.style.backgroundColor = '';
                if (messageId.matches(':hover')) {
                    toolsId.style.display = 'inline-block';
                }
            }
        });

        return editInput;
    } else {
        const messageInput = document.getElementById('message');
        const messageButton = document.querySelector('.chat-input').querySelector('button');

        messageInput.id = 'editMessage';
        const editMessage = document.getElementById('editMessage');

        const chatInput = document.getElementById('chatInput');
        const chatMsgEdit = document.createElement('div');
        chatMsgEdit.innerHTML = `
        <div class="chat-reply" data-id="${msgId}">
            <a href="#message-${msgId}">${localeType === 'en' ? 'Edit message' : 'Редактор сообщения'}</a>
            <b id="closeEditMenu">X</b>
        </div>
`;
        chatInput.appendChild(chatMsgEdit);

        chatMsgEdit.addEventListener('click', () => {
            messageInput.value = '';
            messageInput.id = 'message';
            messageId.style.backgroundColor = '';
            chatMsgEdit.remove();
            return;
        });

        messageInput.value = message.textContent;
        messageInput.focus();
        editMessage.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const newText = editMessage.value.trim();
                if (newText !== '' && newText !== message.textContent) {
                    const value = editMessage.value;
                    socket.emit('editMsg', {channelId: channelId, msgId: msgId, newMsg: value});
                    messageInput.value = '';
                    messageInput.id = 'message';
                    messageId.style.backgroundColor = '';
                    chatMsgEdit.remove();
                }
            }
        });
        messageButton.addEventListener('click', () => {
            const newText = editMessage.value.trim();
            if (newText !== '' && newText !== message.textContent) {
                const value = editMessage.value;
                socket.emit('editMsg', {channelId: channelId, msgId: msgId, newMsg: value});
                messageInput.value = '';
                messageInput.id = 'message';
                messageId.style.backgroundColor = '';
                chatMsgEdit.remove();
            }
        })
        setTimeout(() => toolsId.style.display = 'none', 100);

        return editMessage;
    }
}

socket.on('editedMsg', async (editMsg) => {
    const message = document.getElementById('msg-'+editMsg.msgId);
    const edited = document.getElementById('edited-'+editMsg.msgId);

    function linkify(text) {
        const urlPattern = /(\bhttps?:\/\/[^\s<>]+[^\s<>,.?!])/gi;
        return text.replace(urlPattern, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="a-link">${url}</a>`;
        });
    }

    message.innerHTML = linkify(editMsg.editMessage);
    edited.textContent = localeType === 'en' ? '(Edited)' : '(Изменено)';

    const replyContainers = document.querySelectorAll('.reply-container');
    replyContainers.forEach(rc => {
        const dataMsgId = rc.getAttribute('data-msgId');
        if (dataMsgId === editMsg.msgId) {
            console.log('dataMsgId', dataMsgId);
            rc.innerHTML = `
                <div class="reply-line-wrapper">
                    <div class="reply-line"></div>
                    <img class="reply-avatar" src="${editMsg.userImage}">
                </div>
                <div class="reply-text-container">
                    <div class="reply-header"><strong>${editMsg.userName}</strong></div>
                        <div class="reply-text">
                        ${editMsg.editMessage.length > 100 ? editMsg.editMessage.slice(0, 100) + '...' : editMsg.editMessage}
                        ${editMsg.editMessage.length >= 50 ? '<br/>' : ''}
                        <span class="edited-msg">${localeType === 'en' ? '(Edited)' : '(Изменено)'}</span>
                    </div>
                </div>`
        }
    });
});


function msgReplyMenu(msgId, msgName) {
    const chatInput = document.getElementById('chatInput');
    const allReply = chatInput.querySelectorAll('.chat-reply');
    const chatReply = document.createElement('div');
    const message = document.getElementById('message-'+msgId);
    const toolsId = document.getElementById('tools-'+msgId);
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
            <a href="#message-${msgId}">${localeType === 'en' ? 'Reply ' + msgName : 'Ответить ' + msgName}</a>
            <b id="closeReplyMenu">X</b>
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
    if (document.body.offsetWidth < 1000) {
        setTimeout(() => toolsId.style.display = 'none', 100);
    }
}

function findReplyMsg(msgId) {
    const message = document.querySelectorAll('.message');
    const msg = document.getElementById('message-'+msgId);

    message.forEach(msgs => {
        msgs.style.backgroundColor = '';
    })
    setTimeout(() => msg.style.backgroundColor = '#363a53', msg.style.transitionDuration = '0.3s', 100);
    setTimeout(() => msg.style.backgroundColor = '', 2000);
}


function msgDeleteMenu(channelId, msgId) {
    const deleteMenu = document.createElement('div');
    const barrier = document.getElementById('barrier');

    deleteMenu.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Are you sure you want to delete this message?` : `Вы действительно хотите удалить это сообщение?`}</h4>
        <div class="delete-modal">
            <button id="requestBtn">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>
`;

    barrier.hidden = false;
    document.body.appendChild(deleteMenu);

    document.getElementById('requestBtn').addEventListener('click', () => {
        socket.emit('deleteMsg', {channelId: channelId, msgId: msgId });
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
    });
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
    });
    barrier.addEventListener('click', () => {
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
    });
}