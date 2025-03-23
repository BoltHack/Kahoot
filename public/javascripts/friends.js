// const socket = io();

socket.on('connect', () => {
    if (localStorage.getItem('token')) {
        if (sendId === undefined) {
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }
        const userId = sendId;
        socket.emit('registerUser', userId);
        console.log(`Пользователь ${userId} зарегистрирован`);
    }
});

function addFriend() {
    const friendId = document.getElementById('friendId').value;
    if (typeof socket !== 'undefined') {

        fetch(`/getUserData/${sendId}`, {
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

socket.on('friendRequest', async (requestData) => {
    console.log('requestData', requestData);
    requestFriendMenu(requestData);
})

socket.on('updateMyFriendsCount', async (updateMyFriendsCount) => {
    const friendsLoaderSvg = document.getElementById('friendsLoaderSvg');

    const myFriendsCount = document.getElementById('myFriendsCount');
    if (myFriendsCount && Array.isArray(updateMyFriendsCount)) {
        friendsLoaderSvg.style.display = 'none';
        myFriendsCount.innerHTML = updateMyFriendsCount
            .map(friends => `
<br>
<div class="friend-container">
    <div style="display: flex; gap: 10px;">
        <img src="data:image/png;base64,${friends.image}" class="friend-image">
        <p>${friends.name}</p>
        <a onclick="deleteFriend('${friends.id}')" class="friend-delete-a">${localeType === 'en' ? 'Delete' : 'Удалить'}</a>
        ${window.location.pathname.startsWith('/game/') ?
                `<a onClick="inviteFriend('${friends.id}')" class="friend-invite-a">${localeType === 'en' ? 'Invite' : 'Пригласить'}</a>`
                : ''
            }
    </div>
    <br>
</div>
   
`)
            .join('');
    }
    if (!updateMyFriendsCount || !updateMyFriendsCount.length) {
        friendsLoaderSvg.style.display = 'none';
        myFriendsCount.innerHTML = `<p style="position: absolute; left: 50%; transform: translate(-50%); font-size: 16px;">${localeType === 'en' ? 'you have no friends :(' : 'У вас нет друзей :('}</p>
<br>
<br>
`;
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