const socket = io();

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
        <a onclick="deleteFriend('${friends.id}')">${localeType === 'en' ? 'Delete' : 'Удалить'}</a>
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

const account = document.getElementById('account');
const myToken = localStorage.getItem('token');
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
if (myToken){
    account.innerHTML = `
<div class="dropdown">
    <a class="ha dropdown-title" style="color: #ced4da; background-color: #1C2025;">${userInfo.name}</a>
    <div class="dropdown-content">
        <a onclick="logout();">${localeType === 'en' ? 'Sign Out' : 'Выйти'}</a>
    </div>
</div>
`
}
else{
    account.innerHTML = `<a href="/auth/login" class="ha">${localeType === 'en' ? 'Sign in' : 'Войти'}</a>`
}


function logout() {
    fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => res.json()).then((res) => {
        const {status, error} = res;
        if (error) {
            return;
        }

        if (status) {
            localStorage.removeItem('name');
            localStorage.removeItem('return_id');
            localStorage.removeItem('token');
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            window.location.href = "/auth/login";
            return;
        }
    });
}


function checkGamePath(){
    if (!window.location.pathname.startsWith('/game/') && sessionStorage.getItem('gamePage') === 'true'){
        // sessionStorage.removeItem('gamePage');
        sessionStorage.setItem('gamePage', 'false');
    }
}
checkGamePath();