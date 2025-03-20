// const socket = io();

socket.on('connect', () => {
    const userId = sendId;
    socket.emit('registerUser', userId);
    console.log(`Пользователь ${userId} зарегистрирован`);
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
                        timer: 2000,
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
                                text: localeType === 'en' ? 'This player is already on your friends list.' : 'Данный игрок уже есть в вашем списке друзей.',
                                icon: "error",
                                position: "top-end",
                                timer: 2000,
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
                            Swal.fire({
                                text: localeType === 'en' ? 'Friend request sent!' : 'Запрос на дружбу отправлен!',
                                icon: "success",
                                position: "top-end",
                                timer: 2000,
                                showConfirmButton: false,
                                toast: true,
                                customClass: {
                                    popup: "small-alert"
                                }
                            });
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
    console.log('updateMyFriendsCount', updateMyFriendsCount);
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
        myFriendsCount.innerHTML = `<p>${localeType === 'en' ? 'you have no friends :(' : 'У вас нет друзей :('}</p>`;
    }
});

socket.on('updateMyFriendsBroadcast', async () => {
    Swal.fire({
        text: localeType === 'en' ? 'Player Accepted your request' : 'Игрок Принял ваш запрос!',
        icon: "success",
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
})

let alreadyFriendAdd = [];

function deleteFriend(deleteId){
    alreadyFriendAdd.slice(deleteId)
    console.log('test', deleteId);
    socket.emit('delete-friend', {deleteData: {deleteId: deleteId, myId: sendId} });
}


function inviteFriend(friendId) {
    if (typeof socket !== 'undefined') {

        socket.emit('inviteFriend', {senderData: { senderId: sendId, gameId: gamesId, friendId: friendId } });
        console.log('friendId', friendId);
        Swal.fire({
            text: localeType === 'en' ? 'Invitation sent!' : 'Приглашение отправлено!',
            icon: "success",
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            customClass: {
                popup: "small-alert"
            }
        });

    } else {
        console.error("Игрок не найден.");
    }
}

socket.on('inviteRequest', async (requestData) => {
    console.log('inviteData', requestData);
    inviteFriendMenu(requestData);
})
