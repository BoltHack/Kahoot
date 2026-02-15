socket.on('connect', () => {
    if (localStorage.getItem('token')) {
        if (typeof socket !== "undefined" && sendId) {
            socket.emit('registerUser', sendId);
            console.log(`Пользователь ${sendId} зарегистрирован`);
        }
        else {
            console.error(`Friend socket or sendId is not defined.`);
        }
    }
});

function sendFriendRequest() {
    const friendName = document.getElementById('friendName').value.toLowerCase();
    console.log('friendName', friendName)
    addFriend(friendName);
}

function addFriend(friendName) {
    if (typeof socket !== 'undefined' && friendName.length > 0) {
        socket.emit('addFriend', { senderId: sendId, friendName: friendName });
        console.log('friendId', friendName);
        if (document.getElementById('friendName'))
            document.getElementById('friendName').value = '';
    } else {
        console.error("Игрок не найден.");
    }
}

socket.on('broadcastFriendIdSenderId', async () => {
    showToast('error', localeType === 'en' ? "You can't be friends with yourself!" : 'Вы не можете подружиться с самим собой!');
})

socket.on('broadcastAlreadyFriend', async () => {
    showToast('error', localeType === 'en' ? 'This player is already on your friends list.' : 'Данный игрок уже в вашем списке друзей.');
})

socket.on('broadcastFriendNotFound', async () => {
    showToast('error', localeType === 'en' ? 'Nickname not found.' : 'Никнейм не найден.');
})

socket.on('friendRequest', async (requestData) => {
    console.log('requestData', requestData);
    requestFriendMenu(requestData);
})

socket.on('updateMyFriendsCount', async (updateMyFriendsCount) => {
    if (window.location.pathname.startsWith('/game') || window.location.pathname === '/channels/@me') {
        const friendsLoaderSvg = document.getElementById('friendsLoaderSvg');

        const myFriendsCount = document.getElementById('myFriendsCount');
        if (Array.isArray(updateMyFriendsCount) && updateMyFriendsCount.length > 0) {
            friendsLoaderSvg.style.display = 'none';
            myFriendsCount.innerHTML = updateMyFriendsCount
                .map(friends => `
<span>
<div class="friend-container" id="friend-container">
    <div class="friend-info-row">
        <div class="avatar-wrapper" title="${friends.onlineMod === 'Online' ? localeType === 'en' ? 'Online' : 'В сети' : localeType === 'en' ? 'Offline' : 'Не в сети'}" onclick="window.open('/user-profile/${friends.id}', '_blank')">
            <img src="${friends.image}" alt="Avatar" class="friend-avatar">
            <div class="status ${friends.onlineMod === 'Online' ? 'online' : 'offline'}"></div>
        </div>
        <div class="friend-name user-name">${friends.name}</div>
        ${window.location.pathname === '/channels/@me' ?
                    `<a class="friend-btn" onclick="checksChannel('${friends.id}')">
                        <svg class="icon_f8fa06" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" class=""></path></svg>
                    </a>` : ''}
        ${window.location.pathname.startsWith('/game/') ?
                    `<a class="friend-btn" onclick="inviteFriend('${friends.id}')">${localeType === 'en' ? 'Invite' : 'Пригласить'}</a>` : ''}
        <a class="friend-btn delete" onclick="deleteFriend('${friends.id}', '${friends.name}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </a>
    </div>
</div>
</span>
`).join('');
        }
        else {
            friendsLoaderSvg.style.display = 'none';
            myFriendsCount.innerHTML = `<p>${localeType === 'en' ? 'you have no friends :(' : 'У вас нет друзей :('}</p>
<br>
<br>
`;
        }
    }
});

function checksChannel(friendId) {
    console.log('friendId', friendId);
    fetch(`/checkChannel/${friendId}`,{
        method: "POST",
    })
        .then(function (response) {
            response.json().then(function (data) {
                console.log('data', data);
                window.location.href = `/channels/@me/${data.channelId}`;
            })
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

socket.on('broadcastUpdateMyFriends', async () => {
    showToast('success', localeType === 'en' ? 'Player accepted your request' : 'Игрок принял ваш запрос!');
});

let alreadyFriendAdd = [];

function deleteFriend(deleteId, deleteName){
    const barrier = document.getElementById('barrier');
    const deleteBorder = document.createElement('div');

    barrier.hidden = false;
    disableScroll();

    deleteBorder.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Remove "${deleteName}" from friends?` : `Удалить "${deleteName}" из друзей?`}</h4>
        <div class="delete-modal">
            <button id="requestDeleteFriend">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>`

    document.body.appendChild(deleteBorder);
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        document.body.removeChild(deleteBorder);
        barrier.hidden = true;
        enableScroll();
    });

    document.getElementById('requestDeleteFriend').addEventListener('click', () => {
        alreadyFriendAdd.slice(deleteId)
        console.log('delete', deleteId);
        socket.emit('delete-friend', {deleteData: {deleteId: deleteId, myId: sendId} });
        document.body.removeChild(deleteBorder);
        barrier.hidden = true;
        enableScroll();
    });
}


function inviteFriend(friendId) {
    if (typeof socket !== 'undefined') {
        socket.emit('inviteFriend', {senderData: { senderId: sendId, friendId: friendId, gameId: gamesId} });
        console.log('friendId', friendId);
    } else {
        console.error("Игрок не найден.");
    }
}

socket.on('inviteRequest', async (requestData) => {
    console.log('inviteData', requestData);
    inviteFriendMenu(requestData);
})

socket.on('playerIsOffline', async () => {
    showToast('error', localeType === 'en' ? 'Player is offline.' : 'Игрок не в сети.');
})

socket.on('broadcastInviteRequest', async () => {
    showToast('success', localeType === 'en' ? 'Invitation sent!' : 'Приглашение отправлено!');
})
socket.on('broadcastAcceptInvite', async (data) => {
    showToast('success', localeType === 'en' ? `${data.requestData.name} accepted your invitation!` : `${data.requestData.name} принял ваше приглашение!`);
})

socket.on('broadcastRejectInvite', async (data) => {
    showToast('error', localeType === 'en' ? `${data.requestData.name} declined your invitation!` : `${data.requestData.name} отклонил ваше приглашение!`);
})

socket.on('broadcastFriendRequest', async () => {
    showToast('success', localeType === 'en' ? 'Friend request sent!' : 'Запрос на дружбу отправлен!');
})

socket.on('updatePage', async () => {
    if (window.location.pathname === '/channels/@me') {
        window.location.reload();
    }
})

const addFriendBtn = document.querySelectorAll('.addFriendBtn');
const friendsContainerBtn = document.querySelectorAll('.friendsContainerBtn');

const mediaBorder = document.getElementById('mediaBorder');

const friendsContainerMenu = document.getElementById('friendsContainerMenu');
const addFriendMenu = document.getElementById('addFriendMenu');
const chatName = document.getElementById('chatName');

const checkIcon = document.getElementById('check-icon');

const menus = JSON.parse(sessionStorage.getItem('menus') || '{}');

function addFriendFunc() {
    console.log('addFriendBtn');
    window.location.pathname !== '/channels/@me' ? window.location.href = '/channels/@me' : '';
    addFriendMenuOpen();
    friendsContainerMenuClose();
    mediaBorder.style.display = mediaBorder.style.display === 'block' ? 'none' : '';
    if (checkIcon.checked) checkIcon.checked = false;
}

function friendsContainerFunc() {
    console.log('friendsContainerBtn');
    window.location.pathname !== '/channels/@me' ? window.location.href = '/channels/@me' : '';
    addFriendMenuClose();
    friendsContainerMenuOpen();
    mediaBorder.style.display = mediaBorder.style.display === 'block' ? 'none' : '';
    if (checkIcon.checked) checkIcon.checked = false;

}

function addFriendMenuOpen() {
    menus.addFriendMenu = 'true';
    sessionStorage.setItem('menus', JSON.stringify(menus));

    addFriendMenu.style.display = 'block';
    addFriendBtn.forEach(menus => {
        menus.style.background = '#3b464f';
    });
    chatName.innerText = localeType === 'en' ? 'Add as friend' : 'Добавить в друзья';
}
function addFriendMenuClose() {
    menus.addFriendMenu = 'false';
    sessionStorage.setItem('menus', JSON.stringify(menus));

    addFriendMenu.style.display = 'none';
    addFriendBtn.forEach(menus => {
        menus.style.background = 'none';
    });
}


function friendsContainerMenuOpen() {
    menus.friendsContainerMenu = 'true';
    sessionStorage.setItem('menus', JSON.stringify(menus));

    friendsContainerMenu.style.display = 'block';
    // friendsContainerBtn.style.background = '#3b464f';
    friendsContainerBtn.forEach(menus => {
        menus.style.background = '#3b464f';
    });
    chatName.innerText = localeType === 'en' ? 'Friends' : 'Друзья';
}
function friendsContainerMenuClose() {
    menus.friendsContainerMenu = 'false';
    sessionStorage.setItem('menus', JSON.stringify(menus));

    friendsContainerMenu.style.display = 'none';
    // friendsContainerBtn.style.background = 'none';
    friendsContainerBtn.forEach(menus => {
        menus.style.background = 'none';
    })
}


const searchInput = document.getElementById('searchInput');
if (window.location.pathname === '/channels/@me') {
    window.addEventListener('load', () => {
        setTimeout(function () {
            socket.emit('requestMyFriendsCount', sendId);
        }, 500);
    });

    setInterval(function () {
        if (searchInput.value.length === 0) {
            console.log('online mod');
            socket.emit('requestMyFriendsCount', sendId);
        }
    }, 5000);

}
if (window.location.pathname === '/channels/@me') {
    searchInput.addEventListener('input', function() {
        const searchValue = this.value.trim().toLowerCase();
        const userList = document.getElementById('myFriendsCount');
        const users = userList.getElementsByTagName('span');

        Array.from(users).forEach(user => {
            const userNameElement = user.querySelector('.user-name');

            const userName = userNameElement ? userNameElement.textContent.toLowerCase() : '';

            user.style.display = (userName.includes(searchValue)) ? '' : 'none';
        });
    });
}

socket.on('sendMissedMessage', async (msgData) => {
    function generateRandomNumber() {
        const min = 10000;
        const max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (window.location.pathname !== `/channels/@me/${msgData.channelId}` && pushNotifications === 'on') {
        console.log('Вы пропустили сообщение');

        const alert = document.createElement('div');
        const randomNumbers = generateRandomNumber();
        const popupId = `messagePopup-${randomNumbers}`;
        const closeId = `closePopup-${randomNumbers}`;

        alert.innerHTML = `
      <div class="message-popup" id="${popupId}">
        <span class="message-popup-close" id="${closeId}">x</span>
        <img class="avatar" src="${msgData.image}" alt="Аватарка пользователя" />
        <div class="message-popup-content">
          <div style="display: flex; gap: 5px;">
            <h4>${msgData.name}</h4>
            <span onclick="checksChannel('${msgData.id}')">${localeType === 'en' ? 'Reply' : 'Ответить'}</span>
          </div>
          <p>${msgData.message.length > 20 ? msgData.message.slice(0, 20) + '...' : msgData.message}</p>
        </div>
      </div>
    `;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.classList.add('showMissedMsg');
        }, 500);

        document.getElementById(closeId).addEventListener('click', () => {
            const messagePopup = document.getElementById(popupId);
            if (messagePopup) {
                alert.classList.add('hideMissedMsg');
                setTimeout(() => {
                    messagePopup.style.display = 'none';
                }, 1000);
            }
        });
    }
});
