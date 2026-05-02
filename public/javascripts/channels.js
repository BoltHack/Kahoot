// const secretKey = "wBHC*QtE6ga%7tM1qE54T=pXVLI№iL";

// function encryptData(data, secretKey) {
//     const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
//     return ciphertext;
// }


function sendMessage() {
    const chatReply = document.querySelector('.chat-reply');
    const message = document.getElementById('message');
    const messages = document.querySelectorAll('.message');

    const replyId = chatReply ? chatReply.getAttribute('data-id') : null;

    const chatInput = document.getElementById('chatInput');
    const allReply = chatInput.querySelectorAll('.chat-reply');

    const messagesToSend = message.textContent.trim();

    if (messagesToSend.length > 0) {
        socket.emit('sendMessage', {
            channelId: channelId,
            id: sendId,
            name: sendName,
            companionId: companionId,
            message: messagesToSend,
            replyId: replyId
        });
        message.textContent = '';
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
        if (!event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
});
input.addEventListener('input', () => {
    if (input.textContent.trim() === '') {
        if (input.innerHTML !== '') {
            input.innerHTML = '';
        }
    }
});

const messagesBlock = document.getElementById('messages');

let isWindowScrolling = true;
let scrollTimeout;
let isMsgFind = false;
let currentTargetMsgId = null;


messagesBlock.addEventListener('scroll', function () {
    isWindowScrolling = true;
    // console.log('Блок прокручивается...');

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        isWindowScrolling = false;

        if (currentTargetMsgId && isMsgFind === true) {
            const msg = document.getElementById('message-' + currentTargetMsgId);

            isMsgFind = false;
            console.log('light msg', currentTargetMsgId);
            msg.classList.add('reply-highlight');
            setTimeout(() => msg.classList.remove('reply-highlight'), 2000);
        }
        currentTargetMsgId = null;
    }, 200);
});
function windowScrollingActions(msgId) {
    currentTargetMsgId = msgId;
    console.log('currentTargetMsgId', msgId);
}

function findLastMessage() {
    const hash = window.location.hash;

    if (hash) {
        const msgId = window.location.hash.slice(46);
        const message = document.getElementById('message-' + msgId);
        // const replyMsgId = window.location.hash.slice(9, 33);

        if (!message) {
            socket.emit('loadMessages', { sendId, channelId });
            return;
        }

        message.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        history.pushState(null, null, location.href.split('#')[0]);

        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        const totalPageHeight = document.documentElement.scrollHeight;

        if (windowHeight + scrollPosition >= totalPageHeight) {
            // setTimeout(() => {
                findReplyMsg(msgId);
            // }, 100);
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

let isScrollingUpdate = false;
window.addEventListener('load', () => {
    socket.emit('loadMessages', { sendId, channelId });
    document.getElementById('messages').style.overflowY = 'hidden';
    isScrollingUpdate = true;

    checkOnline();
    setInterval(() => isChecking = true, 1000);
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
                <a class="reply-container" data-msgId="${showMessagesData.reply.msgId}" id="replyContainer-${showMessagesData.reply.msgId}" onclick="findReplyMsg('${showMessagesData.reply.msgId}', '${showMessagesData._id}', 'find')">
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

    const scrollTop = chatContainer.scrollTop;
    const scrollBottom = chatContainer.scrollHeight - chatContainer.clientHeight;

    if (Math.abs(scrollTop - scrollBottom) <= 1000) {
        scrollToBottom();
    }

});


function showTools(msgData) {
    const message = document.getElementById('message-'+msgData.msgId);
    const toolsId = document.getElementById('tools-'+msgData.msgId);
    const dropdownMenu = toolsId.querySelector('.dropdown-menu');

    if (dropdownMenu.style.display === 'flex') return;

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
    } else {
        document.querySelectorAll('.message').forEach(msg => {
            const msgId = msg.dataset.id;
            msg.querySelector('.tools-settings').style.display = 'none';
            // document.querySelector('.chat-messages').style.paddingBottom = '135px';

            if (!msg.dataset.holdListenerAdded) {
                msg.dataset.holdListenerAdded = "true";

                addHoldListener(msg, 600, () => {
                    setTimeout(() => openToolsMenu(msgId), 100);
                });
            }
        });
    }
}
function openToolsMenu(msgId) {
    const message = document.getElementById('message-'+msgId);
    const toolsId = document.getElementById('tools-'+msgId);
    const dropdownMenu = toolsId.querySelector('.dropdown-menu');

    // const rect = toolsId.getBoundingClientRect();
    // dropdownMenu.style.top = `${rect.top}px`;

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
            closeToolsMenu();
        }
    });
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            closeToolsMenu();
        });
    });
    if (document.body.offsetWidth < 700) {
        window.addEventListener('popstate',  (e) => {
            if (dropdownMenu.style.display === 'flex') {
                e.preventDefault();
                closeToolsMenu();
            }
        })
    } else {
        const rect = toolsId.getBoundingClientRect();

        dropdownMenu.style.top = `${rect.top}px`;
        dropdownMenu.style.bottom = 'auto';

        const availableHeight = window.innerHeight - rect.top - 20;
        dropdownMenu.style.maxHeight = `${Math.min(availableHeight, 220)}px`;
    }

    function closeToolsMenu() {
        toolsId.querySelector('.dropdown-menu').style.display = 'none';
        message.style.backgroundColor = '';
        toolsId.style.display = 'none';
        toolsId.querySelector('.menu-trigger').style.backgroundColor = '';
        // document.querySelector('.chat-messages').style.paddingBottom = '135px';
        // document.querySelector('.chat-messages').style.marginTop = '80px';
    }
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
    const onlineMod = document.getElementById('onlineMod');

    if (data.userOnline === null) {
        onlineMod.innerText = '';
        return;
    }

    onlineMod.innerText =
        data.userOnline === 'Online' ? localeType === 'en' ? 'Online' :
            'В сети' : localeType === 'en' ? 'Offline' : 'Не в сети';
});

if (window.location.pathname.startsWith('/channels/')) {
    socket.emit('joinRoom', {
        sendId,
        channelId
    });
}
else {
    socket.emit('leaveRoom', {
        sendId,
        channelId
    });
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

    // const messageDivScroll = messagesDiv.scrollTop;
    messagesDiv.addEventListener('scroll', function() {
        const scrollFromBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight;

        // if (Math.floor(messagesDiv.scrollTop) + 10000 < Math.floor(messageDivScroll)) {
        if (scrollFromBottom > 30000) {
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
    }, {passive: true});
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

    // const dataToEncrypt = linkify(editMsg.editMessage);
    // const encrypted = encryptData(dataToEncrypt, secretKey);
    // console.log('Зашифровано:', encrypted);
    //
    // const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
    // console.log("Расшифровано:", decrypted);
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

let findMsgFunc;
function findReplyMsg(replyMsgId, msgId, type) {
    console.log('find reply', replyMsgId, msgId);
    // console.log('replyMsgId', replyMsgId, 'msgId', msgId);
    const message = document.querySelectorAll('.message');
    const replyMsg = document.getElementById('message-' + replyMsgId);

    if (!replyMsg) {
        scrollToTop(channelId, replyMsgId, msgId, sendId)
        return;
    }

    message.forEach(msgs => {
        msgs.style.backgroundColor = '';
    });

    replyMsg.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    if (type === 'find') {
        console.log('find');
        window.history.replaceState({}, "", '#message-' + replyMsgId + '#origMessage-' + msgId);
    } else {
        window.history.pushState(null, null, location.href.split('#')[0]);
    }

    replyMsg.classList.remove('reply-highlight');
    clearTimeout(findMsgFunc);
    findMsgFunc = setTimeout(() => {
        if (isWindowScrolling) {
            console.log('scroll - yes');
            windowScrollingActions(replyMsgId);
            void replyMsg.offsetWidth;
            isMsgFind = true;
        } else {
            console.log('scroll - no');
            void replyMsg.offsetWidth;
            replyMsg.classList.add('reply-highlight');
            setTimeout(() => {
                replyMsg.classList.remove('reply-highlight');
                isMsgFind = false;
            }, 2000);
        }
    }, 200);
}


function msgDeleteMenu(channelId, msgId) {
    const deleteMenu = document.createElement('div');
    const barrier = document.getElementById('barrier');

    deleteMenu.innerHTML = `
    <div class="delete-border media-menu-border">
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

async function msgCopyFunc(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.log('text copy error', err);
    }

}

function scrollToTop(channelId, msgId, msg_id, sendId) {
    const topMessage = chatContainer.querySelector('.message');
    if (!topMessage) return;
    socket.emit('find-notLoaded-message', { channelId, msgId, msg_id, sendId });
}

socket.on('findReply_msg', async (data) => {
    const { msgId, msg_id } = data;
    console.log('find', msgId, msg_id);
    // setTimeout(() => findReplyMsg(msgId, msg_id, 'find'), 500);
    // if (document.querySelector('.loader-bottom').style.display === 'none') return;
    findReplyMsg(msgId, msg_id, 'find');
    setTimeout(() => {
        document.querySelector('.loader-bottom').style.display = 'block';
    }, 2000);
});


let isMoreMessages = true;

socket.on('loadMessages-front', async (data) => {
    isLoading = false;
    console.log('data', data);
    const { myData, messages, companion, isScrollLoad: isLoadStep, isMore, direction } = data;

    if (document.getElementById('messages').style.overflowY === 'hidden') {
        document.getElementById('messages').style.overflowY = 'auto';
    }

    const chatContainer = document.getElementById('messages');

    if (!direction || direction === 'init') {
        chatContainer.innerHTML = '';
    }

    if (!isLoadStep) {
        chatContainer.querySelectorAll('.message').forEach(el => el.remove());
    }

    checkPageHeight();

    if (messages && messages.length > 0) {
        const oldHeight = chatContainer.scrollHeight;
        const fragment = document.createDocumentFragment();

        messages.forEach(msg => {
            if (msg.isDeleted === true) return;

            const node = createMessageElement(msg, myData, companion || '/images/defaultUser.png', messages);
            fragment.appendChild(node);
        });

        if (direction === 'top') {
            const infoBlock = chatContainer.querySelector('.companion-info');
            infoBlock.after(fragment);
            chatContainer.scrollTop = chatContainer.scrollHeight - oldHeight;
        } else if (direction === 'bottom' && currentObservedElement !== null) {
            chatContainer.appendChild(fragment);
            chatContainer.scrollTop = oldHeight;
        } else {
            chatContainer.appendChild(fragment);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    isMoreMessages = isMore;

    if (isScrollingUpdate) scrollToBottom();

    if (!isMoreMessages) {
        if (direction === 'top') {
            document.querySelector('.loader-top').style.display = 'none';
            document.querySelector('.companion-info').style.display = 'block';
        } else {
            document.querySelector('.loader-bottom').style.display = 'none';
        }
    }

});

function createMessageElement(msg, myData, companion) {
    const template = document.getElementById('message-template');

    if (!template) {
        console.error("Ошибка: Шаблон 'message-template' не найден на странице!");
        return document.createElement('div');
    }

    // chatContainer.innerHTML = '';

    const clone = template.content.cloneNode(true);

    const msgEl = clone.querySelector('.message');
    // const messagesCount = msgEl.querySelector('.reply-container');
    // const isMyMsg = msg.id === myData.id;

    msgEl.setAttribute('data-id', msg._id);
    msgEl.id = `message-${msg._id}`;
    // msgEl.onmouseover = () => showTools({msgId: msg._id, myId: msg.id});
    msgEl.onmouseover = () => {
        if (typeof showTools === 'function') {
            showTools({
                msgId: msg._id.toString(),
                myId: msg.id
            });
        }
    }

    const avatar = clone.querySelector('.avatar');
    const isMe = String(msg.id) === String(myData._id || myData.id);
    avatar.src = isMe ? myData.image : companion;

    if (!msg.isDeleted && msg.reply && msg.reply.length > 0) {
        msgEl.classList.add('reply');
        avatar.classList.add('reply-avatarTop');
        const replyWrapper = clone.querySelector('.reply-wrapper');
        replyWrapper.style.display = 'block';

        const replyData = msg.reply[0];

        const activeReply = clone.querySelector('.reply-active');
        const deletedReply = clone.querySelector('.reply-deleted');
        const notLoadedReply = clone.querySelector('.reply-not-loaded');

        activeReply.style.display = 'none';
        deletedReply.style.display = 'none';
        notLoadedReply.style.display = 'none';

        // const replyMsgId  = replyData.msgId.toString();
        // let msgEdited = allMessages.find(m => m && m._id && m._id.toString() === replyMsgId);

        // console.log('replyData.msgId', replyData.msgId.toString());
        // console.log('msg.reply[0].msgId', msg.reply[0].msgId.toString());

        // if (!msgEdited) {
        //     const existingMsgEl = document.getElementById(`message-${replyMsgId}`);
        //     if (existingMsgEl) {
        //         msgEdited = {
        //             message: existingMsgEl.querySelector('.text').innerText,
        //             name: existingMsgEl.querySelector('.username').textContent,
        //             isDeleted: false,
        //             edited: !!existingMsgEl.querySelector('.edited-msg')
        //         };
        //     }
        // }

        // console.log('replyData', replyData);

        if (replyData.isDeleted) {
            deletedReply.style.display = 'flex';
        } else if (replyData.message && !replyData.isDeleted) {
            activeReply.style.display = 'flex';
            activeReply.setAttribute('data-msgId', replyData.msgId);
            activeReply.id = `replyContainer-${replyData.msgId}`;

            // const myCurrentId = myData.id || myData._id.toString();
            // const isToMe = String(replyData.toWho) === String(myCurrentId);
            // console.log('test', replyData.toWho, myData.id);
            clone.querySelector('.reply-avatar').src = (replyData.toWho === myData.id) ? myData.image : companion;
            clone.querySelector('.reply-name').textContent = replyData.id === sendId ? replyData.name : replyData.id === companionId ? replyData.name : 'Deleted User'

            const replyTextEl = clone.querySelector('.reply-text');

            if (!replyData.edited) {
                replyTextEl.textContent = replyData.message.length > 50 ? replyData.message.slice(0, 50) + '...' : replyData.message;
                activeReply.onclick = () => findReplyMsg(replyData.msgId, msg._id, 'find');
            } else {
                replyTextEl.innerHTML = `${replyData.message.length > 100 ? replyData.message.slice(0, 100) + '...' : replyData.message} <span class="edited-msg">(Изменено)</span>`;
                activeReply.onclick = () => findReplyMsg(replyData.msgId);
            }
        } else {
            notLoadedReply.style.display = 'flex';
            notLoadedReply.setAttribute('data-msgId', replyData.msgId);
            notLoadedReply.id = `replyContainer-${replyData.msgId}`;

            // const myCurrentId = myData.id || myData._id.toString();
            // const isToMe = String(replyData.toWho) === String(myCurrentId);
            clone.querySelector('.reply-avatar').src = (replyData.toWho === myData.id) ? myData.image : companion;
            // clone.querySelector('.reply-name').textContent = replyData.name;

            notLoadedReply.onclick = () => scrollToTop(channelId, replyData.msgId, msg._id, sendId);
        }

        // if (msgEdited) {
        //     if (msgEdited.isDeleted) {
        //         deletedReply.style.display = 'flex';
        //     } else {
        //         activeReply.style.display = 'flex';
        //         activeReply.setAttribute('data-msgId', replyData.msgId);
        //         activeReply.id = `replyContainer-${replyData.msgId}`;
        //
        //         clone.querySelector('.reply-avatar').src = (replyData.toWho === myData.id) ? myData.image : companion;
        //         clone.querySelector('.reply-name').textContent = replyData.name;
        //
        //         const replyTextEl = clone.querySelector('.reply-text');
        //
        //         if (!msgEdited.edited) {
        //             replyTextEl.textContent = msgEdited.message.length > 50 ? msgEdited.message.slice(0, 50) + '...' : msgEdited.message;
        //             activeReply.onclick = () => findReplyMsg(replyData.msgId, msg._id, 'find');
        //         } else {
        //             replyTextEl.innerHTML = `${msgEdited.message.length > 100 ? msgEdited.message.slice(0, 100) + '...' : msgEdited.message} <span class="edited-msg">(Изменено)</span>`;
        //             activeReply.onclick = () => findReplyMsg(replyData.msgId);
        //         }
        //     }
        // } else {
        //     notLoadedReply.style.display = 'flex';
        //     notLoadedReply.setAttribute('data-msgId', replyData.msgId);
        //     notLoadedReply.id = `replyContainer-${replyData.msgId}`;
        //
        //     notLoadedReply.onclick = () => scrollToTop(channelId, replyData.msgId, msg._id, sendId);
        // }
    }

    clone.querySelector('.username').textContent = msg.id === sendId ? msg.name : msg.id === companionId ? msg.name : 'Deleted User';
    clone.querySelector('.timestamp').textContent = formatChatDate(msg.date);

    const textEl = clone.querySelector('.text');
    textEl.id = `msg-${msg._id}`;
    textEl.innerHTML = linkify(msg.message);

    if (msg.edited) {
        const ed = clone.querySelector('.edited-msg');
        ed.id = `edited-${msg._id}`;
        ed.style.display = 'inline';
    }

    const tools = clone.querySelector('.tools');
    tools.id = `tools-${msg._id}`;

    const menuTrigger = tools.querySelector('.menu-trigger');
    const toolsSvg = tools.querySelector('.tools-svg');
    const dropdownMenu = tools.querySelector('.dropdown-menu-tools');

    menuTrigger.onclick = () => openToolsMenu(`${msg._id}`);

    toolsSvg.innerHTML = `
        ${isMe ? `
            <div onclick="msgRedactionMenu('${msg._id}')">
                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z"></path>
                </svg>
            </div>
        ` : `
        `}
        <div onclick="msgReplyMenu('${msg._id}', '${msg.name}')">
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"></path>
            </svg>
        </div>
            `;

    dropdownMenu.innerHTML = `
        <button onclick="msgReplyMenu('${msg._id}', '${msg.name}')">
            ${localeType === 'en' ? 'Reply' : 'Ответить'}
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"></path></svg>
        </button>
        <button onclick="msgCopyFunc('${msg.message}')">
            ${localeType === 'en' ? 'Copy text' : 'Скопировать текст'}
            <svg class="icon_c1e9c4" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3 16a1 1 0 0 1-1-1v-5a8 8 0 0 1 8-8h5a1 1 0 0 1 1 1v.5a.5.5 0 0 1-.5.5H10a6 6 0 0 0-6 6v5.5a.5.5 0 0 1-.5.5H3Z" class=""></path><path fill="currentColor" d="M6 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4h-3a5 5 0 0 1-5-5V6h-4a4 4 0 0 0-4 4v8Z" class=""></path><path fill="currentColor" d="M21.73 12a3 3 0 0 0-.6-.88l-4.25-4.24a3 3 0 0 0-.88-.61V9a3 3 0 0 0 3 3h2.73Z" class=""></path>
            </svg>
        </button>
        ${isMe ? `
        <button onclick="msgRedactionMenu('${msg._id}', '${msg.name}')">
            ${localeType === 'en' ? 'Edit' : 'Редактировать'}
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z"></path>
            </svg>
        </button>
        <div class="tools-line"></div>
        <button style="color: #f47171" onclick="msgDeleteMenu('${channelId}', '${msg._id}')">
            ${localeType === 'en' ? 'Delete message' : 'Удалить сообщение'}
            <svg class="icon_c1e9c4" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z" class=""></path><path fill="currentColor" fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd" class=""></path>
            </svg>
        </button>
    ` : ''}
       
    `


    return clone;
}

function linkify(text) {
    const urlPattern = /(\bhttps?:\/\/[^\s<>]+[^\s<>,.?!])/gi;
    return text.replace(urlPattern, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="a-link">${url}</a>`);
}

function formatChatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
    const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);

    if (localeType === 'en') {
        if (isSameDay(d, now)) {
            return 'Today, ' + d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else if (isSameDay(d, yesterday)) {
            return 'Yesterday, ' + d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else {
            return d.toLocaleString('en-US', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit', minute: '2-digit',
                hour12: false
            });
        }
    } else {
        if (isSameDay(d, now)) {
            return 'Сегодня, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else if (isSameDay(d, yesterday)) {
            return 'Вчера, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', hour12: false});
        } else {
            return d.toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit', minute: '2-digit',
                hour12: false
            });
        }
    }
    // if (isSameDay(d, now)) return 'Сегодня, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    // if (isSameDay(d, yesterday)) return 'Вчера, ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    // return d.toLocaleString('ru-RU', {day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

let isLoading = false;
let isChecking = false;
let isBottomMsgLoadingPerm = false;

let currentObservedElement = null;
let lastScrollTop = 0;

const topSentinel = document.getElementById('top-sentinel');
const bottomSentinel = document.getElementById('bottom-sentinel');
const chatContainer = document.getElementById('messages');

const observerTop = new IntersectionObserver(([entry]) => {
    console.log('checking top...', isLoading);

    if (entry.isIntersecting && !isLoading) {
        isLoading = true;
        const topMessage = chatContainer.querySelector('.message');
        if (topMessage) {
            const beforeId = topMessage.dataset.id;

            console.log('Загрузка старых сообщений...');
            socket.emit('loadMessages', { sendId, channelId, beforeId });
        }
    }
}, {
    root: chatContainer,
    threshold: 0.1
});

const observerBottom = new IntersectionObserver(([entry]) => {
    console.log('checking bottom...', isLoading);

    // if (entry.isIntersecting && !isLoading && isBottomMsgLoadingPerm) {
    //     isLoading = true;
    //     const messages = chatContainer.querySelectorAll('.message');
    //     const afterId =  messages[messages.length - 1].dataset.id;
    //
    //     console.log('Загрузка новых сообщений...');
    //     socket.emit('loadMessages-bottom', { sendId, channelId, afterId, });
    // }
    if (entry.isIntersecting && !isLoading && isBottomMsgLoadingPerm) {
        isLoading = true;
        const bottomMessage = chatContainer.querySelector('.message');
        if (bottomMessage) {
            const messages = chatContainer.querySelectorAll('.message');
            const afterId =  messages[messages.length - 1].dataset.id;

            console.log('Загрузка новых сообщений...');
            socket.emit('loadMessages-bottom', { sendId, channelId, afterId, });
        }
    }
}, {
    root: chatContainer,
    rootMargin: '0px 0px 100px 0px',
    threshold: 0
});

observerTop.observe(topSentinel);

chatContainer.addEventListener('scroll', () => {
    const currentScroll = chatContainer.scrollTop;

    if (!isChecking) return;

    if (currentScroll > lastScrollTop) {
        isBottomMsgLoadingPerm = true;
        isScrollingUpdate = false;
        const messages = chatContainer.querySelectorAll('.message');

        const targetIndex = Math.max(0, messages.length - 20);
        const targetElement = messages[targetIndex];

        if (bottomSentinel && targetElement && targetElement !== currentObservedElement) {
            // if (currentObservedElement) observerBottom.unobserve(currentObservedElement);

            // observerBottom.observe(targetElement);
            observerBottom.observe(bottomSentinel);
            currentObservedElement = targetElement;
            // console.log('Следим за сообщением:', targetElement.id);
        }
    } else {
        isBottomMsgLoadingPerm = false;
    }

    lastScrollTop = Math.max(0, currentScroll);
});