const socket = io();

(function () {
    let gameId = game;
    let userId = id;
    let userName = name;

    socket.on('updateUserCount', (onlineCount) => {
        setTimeout(function () {
            socket.emit('requestGameAccessCount');
        }, 500);
        const getId = onlineCount.users.map(user => user.userId) || [];
        const checkAllId = getId.length !== new Set(getId).size;
        if (checkAllId) {
            const errorMsg = localeType === 'en' ? 'You cannot log into the same game with the same account from different browser windows.' : 'Вы не можете зайти в одну и ту же игру с одного аккаунта с разных окон браузера.';
            window.location.href = `/error?code=409&message=${encodeURIComponent(errorMsg)}`;
        }

        const users = document.getElementById('usersCount');
        if (users && Array.isArray(onlineCount.users)) {
            users.innerHTML = onlineCount.users
                .map(user => `
<div class="userImage checkUser" data-id="${user.userId}">
    <div class="avatar-wrapper">
        <img class="avatar" src="${user.userImage}" onmouseover="showUserName(event);" onclick="window.open('/user-profile/${user.userId}', '_blank');" title="Посмотреть профиль">
    </div>
    
    <div id="userName-${user.userId}" class="userName" hidden>
        <span>
  ${user.userId === id
                    ? (localeType === 'en' ? 'You' : 'Вы')
                    : authorId === id
                        ? `${user.userName + ' | '} <button id="ban-${user.userId}" onclick="banUser('${user.userId}')" class="ban-btn">${localeType === 'en' ? 'Ban' : 'Забанить'}</button>
                                        <a id="banLoad-${user.userId}" hidden>${localeType === 'en' ? 'Loading...' : 'Загрузка...'}</a>`
                        : user.userName}
</span>
    </div>
</div>
`)
                .join('');
        }



        // socket.on('requestCheckQuestionsContainer', async () => {
        //     if (document.getElementById('gameQuestions').querySelector('.questions-container')) {
        //         document.getElementById('gameQuestions').querySelector('.questions-container').remove();
        //         requestSent = true;
        //         questions.hidden = true;
        //     }
        // });

        window.manualGameLaunch = function () {
            // if (isGameStart === false && authorId === id && onlineCount.online >= 2) {
                console.log('Socket connected:', socket.connected);
                socket.emit('requestStartGame');
            // }
            // if (onlineCount.online < 2) {
            //     showToast('warning', localeType === 'en' ? 'Few players!' : 'Мало игроков!');
            // }
            // if (isGameStart === true) {
            //     showToast('error', localeType === 'en' ? 'The game has already started!' : 'Игра уже началась!');
            // }
        }

        if (sessionStorage.getItem("redirectAfterReload") === "true") {
            sessionStorage.removeItem("redirectAfterReload");
        }

        socket.on('redirect', (return_id) => {
            window.location.href = '/return-menu';
            sessionStorage.setItem('return_id', return_id);
        });

        socket.on('gameOff', () => {
            const errorMsg = localeType === 'en' ? 'Game is off.' : 'Игра выключена.';
            window.location.href = `/error?code=410&message=${encodeURIComponent(errorMsg)}`;
        });

        socket.on('updateAnswersCount', (answersCount) => {
            document.getElementById('correctAnswersCount').innerHTML = `<span><p class="game_correct-answers">${answersCount[0].game_correct_answers || 0}</p> <p class="game_correct-answers-text">${localeType === 'en' ? 'Correct answers' : 'Правильных ответов'}</p></span>`;
            document.getElementById('answersCount').innerHTML = `<span><p class="game-answers">${answersCount[0].game_answers || 0}/${gameMaxQuestions}</p></span>`;
        });

        socket.on('updateBannedUsersCount', (bannedUsersCount) => {
            const users = document.getElementById('bannedUsersCount');
            const banLoaderSvg = document.getElementById('banLoaderSvg');
            if (users && Array.isArray(bannedUsersCount)) {
                banLoaderSvg.style.display = 'none';
                users.innerHTML = bannedUsersCount
                    .map(user => `
<div class="banned-container" id="banId-${user.bannedId}">
    <div class="userImage">
        <div style="display: block; margin-top: -10px; align-items: center" title="${user.bannedName + ' | ' + user.bannedId}">
            <p>${user.bannedName.length >= 10 ? user.bannedName.slice(0, 10) : user.bannedName}</p>
            <div class="avatar-wrapper" style="margin-top: -14px; margin-left: 14px; margin-bottom: 5px;">
                <img src="${user.bannedImage}" class="avatar" >
            </div>
        </div>
    
        <div id="banName-${user.bannedId}" class="banName">
            <span>
                <button onclick="unbanUser('${user.bannedId}')" data-id="${user.bannedId}" class="unban-btn" style="margin-left: 2px;">${localeType === 'en' ? 'Unban' : 'Разбанить'}</button>
            </span>
        </div>
    </div>
</div>
`)
                    .join('');
            }
            if (!bannedUsersCount || !bannedUsersCount.length) {
                banLoaderSvg.style.display = 'none';
                users.innerHTML = `<p class="not-found">${localeType === 'en' ? 'No banned players.' : 'Нет забаненных игроков.'}</p>`;
            }
        })

        socket.on('updateGameAccessCount', async (data) => {
            if (data.gameData.gameAccess === 'Private') {
                const getId = data.gameData.userFriends?.map(user => String(user.id)) || [];
                if (getId.includes(String(authorId)) || authorId === id) {
                    console.log('пропуск', id);
                } else {
                    const privateKickMsg = localeType === 'en' ? "Access to this game is restricted! You must be on the room creator's friends list to participate." : "Доступ к этой игре ограничен! Вам необходимо быть в списке друзей создателя комнаты, чтобы принять участие.";
                    window.location.assign(`/error?code=403&message=${encodeURIComponent(privateKickMsg)}`);
                }
            }
        });
    });

    socket.emit('joinGame', gameId, userId, userName);

    window.showUserName = function (event) {
        const checkName = document.querySelectorAll('.checkUser');
        event.currentTarget.querySelector("img");

        checkName.forEach(hover => {
            hover.addEventListener('mouseover', function () {
                const dataId = this.getAttribute('data-id');
                const userName = document.getElementById('userName-' + dataId);
                userName.style.display = 'block';
            })
            hover.addEventListener('mouseout', function () {
                const dataId = this.getAttribute('data-id');
                const userName = document.getElementById('userName-' + dataId);
                userName.style.display = 'none';
            })
        })
    }

    let alreadyBannedUserIds = [];

    window.banUser = function (userId) {
        if (typeof socket !== 'undefined') {
            if (authorId === id) {
                console.log('id', id);
                console.log('authorId', authorId);
                if (!alreadyBannedUserIds.includes(userId)) {
                    socket.emit('ban', userId);
                    alreadyBannedUserIds.push(userId);
                    document.getElementById('ban-' + userId).hidden = true;
                    document.getElementById('banLoad-' + userId).hidden = false;
                } else {
                    console.log('Пользователь уже забанен:', userId);
                }
            }
        } else {
            console.error("Игрок не найден.");
        }
    }


    window.unbanUser = function (userId) {
        if (typeof socket !== 'undefined') {
            if (authorId === id) {
                socket.emit('unban', userId);
                alreadyBannedUserIds.splice(userId);
            }
        } else {
            console.error("Игрок не найден.");
        }
    }

    socket.on('reloadPage', () => {
        window.location.reload();
    });

    socket.on('updateGameTypeCount', async (gameTypeCount) => {
        console.log('updateGameTypeCount', gameTypeCount);
        if (gameTypeCount === 'Close') {
            const gameTypeMsg = localeType === 'en' ? 'This game has already begun.' : 'Данная игра уже началась.';
            window.location.replace(`/error?code=409&message=${encodeURIComponent(gameTypeMsg)}`);
        }
    });

}());

socket.on('unbanBroadcast', (data) => {
    setTimeout(function () {
        socket.emit('requestBannedUsersCount');
    }, 500);
    showToast('success', localeType === 'en' ? `Player ${data.userName} has been unbanned!` : `Игрок ${data.userName} разбанен!`);
});

socket.on('banBroadcast', (data) => {
    showToast('success', localeType === 'en' ? `Player ${data.userName} banned!` : `Игрок ${data.userName} забанен!`);
});
