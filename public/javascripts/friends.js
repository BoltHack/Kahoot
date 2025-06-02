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

function addFriend() {
    const friendId = document.getElementById('friendId').value;
    if (typeof socket !== 'undefined' && friendId.length > 0) {

        fetch(`/getUserData`, {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                let {myFriends} = data;
                const getId = myFriends.map(doc => doc.id);

                if (friendId === sendId){
                    Swal.fire({
                        text: localeType === 'en' ? "You can't be friends with yourself!" : 'Вы не можете подружиться с самим собой!',
                        icon: "error",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
                    return;
                }
                if (getId.includes(friendId)) {
                    Swal.fire({
                        text: localeType === 'en' ? 'This player is already on your friends list.' : 'Данный игрок уже в вашем списке друзей.',
                        icon: "error",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
                    return;
                }
                else {
                    socket.emit('addFriend', {senderData: { senderId: sendId, friendId: friendId } });
                    console.log('friendId', friendId);
                }
            })
        document.getElementById('friendId').value = '';
    } else {
        console.error("Игрок не найден.");
    }
}

socket.on('broadcastFriendNotFound', async () => {
    Swal.fire({
        text: localeType === 'en' ? 'unknown ID.' : 'неизвестный ID.',
        icon: "error",
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
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
                    `<a class="friend-btn" onclick="checksChannel('${friends.id}')">${localeType === 'en' ? 'Message' : 'Написать'}</a>` : ''}
        ${window.location.pathname.startsWith('/game/') ?
                    `<a class="friend-btn" onclick="inviteFriend('${friends.id}')">${localeType === 'en' ? 'Invite' : 'Пригласить'}</a>` : ''}
        <a class="friend-btn delete" onclick="deleteFriend('${friends.id}')">${localeType === 'en' ? 'Delete' : 'Удалить'}</a>
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
    Swal.fire({
        text: localeType === 'en' ? 'Player accepted your request' : 'Игрок принял ваш запрос!',
        icon: "success",
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})

let alreadyFriendAdd = [];

function deleteFriend(deleteId){
    document.getElementById('barrier').hidden = false;

    const deleteBorder = document.createElement('div');
    deleteBorder.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Remove this player from friends?` : `Удалить данного игрока из друзей?`}</h4>
        <div class="delete-modal">
            <button id="requestDeleteFriend">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>`
    document.body.appendChild(deleteBorder);
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        document.body.removeChild(deleteBorder);
        document.getElementById('barrier').hidden = true;
    })

    document.getElementById('requestDeleteFriend').addEventListener('click', () => {
        alreadyFriendAdd.slice(deleteId)
        console.log('delete', deleteId);
        socket.emit('delete-friend', {deleteData: {deleteId: deleteId, myId: sendId} });
        document.body.removeChild(deleteBorder);
        document.getElementById('barrier').hidden = true;
    })
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
    Swal.fire({
        text: localeType === 'en' ? 'Player is offline.' : 'Игрок не в сети.',
        icon: "error",
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})

socket.on('broadcastInviteRequest', async () => {
    Swal.fire({
        text: localeType === 'en' ? 'Invitation sent!' : 'Приглашение отправлено!',
        icon: "success",
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})
socket.on('broadcastAcceptInvite', async (data) => {
    Swal.fire({
        text: localeType === 'en' ? `${data.requestData.name} accepted your invitation!` : `${data.requestData.name} принял ваше приглашение!`,
        icon: "success",
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})

socket.on('broadcastRejectInvite', async (data) => {
    Swal.fire({
        text: localeType === 'en' ? `${data.requestData.name} declined your invitation!` : `${data.requestData.name} отклонил ваше приглашение!`,
        icon: "error",
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})

socket.on('broadcastFriendRequest', async () => {
    Swal.fire({
        text: localeType === 'en' ? 'Friend request sent!' : 'Запрос на дружбу отправлен!',
        icon: "success",
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})

socket.on('updatePage', async () => {
    if (window.location.pathname === '/channels/@me') {
        window.location.reload();
    }
})

const addFriendBtn = document.getElementById('addFriendBtn');
const friendsContainerBtn = document.getElementById('friendsContainerBtn');

const friendsContainerMenu = document.getElementById('friendsContainerMenu');
const addFriendMenu = document.getElementById('addFriendMenu');
const chatName = document.getElementById('chatName');

const menus = JSON.parse(localStorage.getItem('menus') || '{}');

function addFriendFunc() {
    console.log('addFriendBtn');
    window.location.pathname !== '/channels/@me' ? window.location.href = '/channels/@me' : '';
    addFriendMenuOpen();
    friendsContainerMenuClose();
}

function friendsContainerFunc() {
    console.log('friendsContainerBtn');
    window.location.pathname !== '/channels/@me' ? window.location.href = '/channels/@me' : '';
    addFriendMenuClose();
    friendsContainerMenuOpen();
}

function addFriendMenuOpen() {
    menus.addFriendMenu = 'true';
    localStorage.setItem('menus', JSON.stringify(menus));

    addFriendMenu.style.display = 'block';
    addFriendBtn.style.background = '#3b464f';
    chatName.innerText = localeType === 'en' ? 'Add as friend' : 'Добавить в друзья';
}
function addFriendMenuClose() {
    menus.addFriendMenu = 'false';
    localStorage.setItem('menus', JSON.stringify(menus));

    addFriendMenu.style.display = 'none';
    addFriendBtn.style.background = 'none';
}


function friendsContainerMenuOpen() {
    menus.friendsContainerMenu = 'true';
    localStorage.setItem('menus', JSON.stringify(menus));

    friendsContainerMenu.style.display = 'block';
    friendsContainerBtn.style.background = '#3b464f';
    chatName.innerText = localeType === 'en' ? 'Friends' : 'Друзья';
}
function friendsContainerMenuClose() {
    menus.friendsContainerMenu = 'false';
    localStorage.setItem('menus', JSON.stringify(menus));

    friendsContainerMenu.style.display = 'none';
    friendsContainerBtn.style.background = 'none';
}
const searchInput = document.getElementById('searchInput');
if (window.location.pathname.startsWith('/friends') || window.location.pathname === '/channels/@me') {
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