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
    if (typeof socket !== 'undefined') {

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
                }
                else {
                    if (friendId !== '') {
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
                        }
                        else {
                            socket.emit('addFriend', {senderData: { senderId: sendId, friendId: friendId } });
                            console.log('friendId', friendId);
                        }
                    }
                }
            })

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
    if (window.location.pathname.startsWith('/friends') || window.location.pathname.startsWith('/game')) {
        const friendsLoaderSvg = document.getElementById('friendsLoaderSvg');

        const myFriendsCount = document.getElementById('myFriendsCount');
        if (Array.isArray(updateMyFriendsCount) && updateMyFriendsCount.length > 0) {
            friendsLoaderSvg.style.display = 'none';
            myFriendsCount.innerHTML = updateMyFriendsCount
                .map(friends => `
<br>
<div class="friend-container">
    <div style="display: flex; gap: 10px;">

    <div class="avatar-wrapper" title="${friends.onlineMod === 'Online' ? localeType === 'en' ? 'Online' : 'В сети' : localeType === 'en' ? 'Offline' : 'Не в сети'}" onclick="window.open('/user-profile/${friends.id}', '_blank')">
        <img src="${friends.image}" alt="Avatar" class="avatar">
        <span class="status ${friends.onlineMod === 'Online' ? 'online' : 'offline'}"></span>
    </div>
        
        <p>${friends.name}</p>
        <div class="friend-interaction"></div>
        <a class="profile-a" href="/user-profile/${friends.id}" target="_blank">${localeType === 'en' ? 'Profile' : 'Профиль'}</a>
        ${window.location.pathname.startsWith('/game/') ?
                    `<a onClick="inviteFriend('${friends.id}')" class="friend-invite-a">${localeType === 'en' ? 'Invite' : 'Пригласить'}</a>`
                    : ''}
        <a onclick="deleteFriend('${friends.id}')" class="friend-delete-a">${localeType === 'en' ? 'Delete' : 'Удалить'}</a>
    </div>
    <br>
</div>
   
`)
                .join('');
        }
        else {
            friendsLoaderSvg.style.display = 'none';
            myFriendsCount.innerHTML = `<p style="position: absolute; left: 50%; transform: translate(-50%); font-size: 16px;">${localeType === 'en' ? 'you have no friends :(' : 'У вас нет друзей :('}</p>
<br>
<br>
`;
        }
    }
});

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
    if (!window.location.pathname.startsWith('/game/')) {
        document.getElementById('barrier').hidden = false;
    }
    const deleteBorder = document.createElement('div');
    deleteBorder.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center">${localeType === 'en' ? `Remove this player from friends?` : `Удалить данного игрока из друзей?`}</h4>
        <div class="delete-modal">
            <button id="requestDeleteFriend">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>`
    document.body.appendChild(deleteBorder);
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        document.body.removeChild(deleteBorder);
        if (!window.location.pathname.startsWith('/game/')) {
            document.getElementById('barrier').hidden = true;
        }
    })

    document.getElementById('requestDeleteFriend').addEventListener('click', () => {
        alreadyFriendAdd.slice(deleteId)
        console.log('delete', deleteId);
        socket.emit('delete-friend', {deleteData: {deleteId: deleteId, myId: sendId} });
        document.body.removeChild(deleteBorder);
        if (!window.location.pathname.startsWith('/game/')) {
        document.getElementById('barrier').hidden = true;
    }
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
    if (window.location.pathname ==='/friends') {
        window.location.reload();
    }
})

if (window.location.pathname.startsWith('/friends') && localStorage.getItem('token')) {
    setInterval(function () {
        console.log('online mod');
        socket.emit('requestMyFriendsCount', sendId);
    }, 20000);
}