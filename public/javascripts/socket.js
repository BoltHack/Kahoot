const socket = io();

let gameId = game;
let userId = id;
let userName = name;

(function () {

    let countdown;
    let timeLeft = 10;
    let questions = document.getElementById('questions');
    let refresh = document.getElementById('refresh');
    let bc = document.getElementById('b-c');

    let requestSent = false;
    let isGameStart = false;

    const startCountdown = () => {
        countdown = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(countdown);
                document.getElementById('timer').innerHTML = '';
                questions.hidden = false;
                requestSent = false;
                refresh.style.display = 'none';
                bc.style.top = '11%';
                checkReload();
                startUpdateTimer();
                soundTrackAuto();
                socket.emit('closeGame');
                // setTimeout(function () {
                //     socket.emit('requestQuestionTimerStart');
                // }, 500);
            } else {
                document.getElementById('timer').innerHTML = `<span class="timer">${localeType === 'en' ? `<p class="beforeStart">Before the game starts</p><p class="timerLeft">${timeLeft}</p>` : `<p class="beforeStart">До начала игры</p><p class="timerLeft">${timeLeft}</p>`}</span>`;
                timeLeft--;
            }
        }, 1000);
    };

    let gameStartTime = Date.now();

    const updateTimer = () => {
        const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);

        // console.log('elapsedTime', elapsedTime, '|', 'requestSent', requestSent);

        document.getElementById('mainTimer').textContent = elapsedTime;

        if (requestSent === false) {
            setTimeout(updateTimer, 1000);
        } else {
            console.log('таймер остановлен');
        }
    };

    const startUpdateTimer = () => {
        gameStartTime = Date.now();
        updateTimer();
    }


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
        document.getElementById('onlineCount').innerText = `${localeType === 'en' ? 'online: ' + onlineCount.online : 'Онлайн: ' + onlineCount.online}`;

        const users = document.getElementById('usersCount');
        if (users && Array.isArray(onlineCount.users)) {
            users.innerHTML = onlineCount.users
                .map(user => `
<br>
<div class="userImage checkUser" data-id="${user.userId}" >
    <img src="${user.userImage}" onmouseover="showUserName(event);" onclick="window.open('/user-profile/${user.userId}', '_blank');" title="Посмотреть профиль">
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

        if (onlineCount.online < 2) {
            clearTimeout(100);
            questions.hidden = true;
            requestSent = true;
            console.log('Онлайна мало');
            clearInterval(countdown);
            timeLeft = 10;
            document.getElementById('timer').innerHTML = `
        <div class="progress">
            <div class="inner"></div>
        </div>
        <p class="pi">${localeType === 'en' ? 'Waiting for players...' : 'Ожидание игроков...'}</p>
        `;
            bc.style.top = '2%';
            stopSound();
        }
        if (onlineCount.online >= 2) {
            fetch(`/getData/${gamesId}`, {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(data => {
                    let {gameType} = data;
                    if (gameType === 'Open') {
                        if (gameStartType === 'Auto') {
                            socket.emit('requestAutoStartGame');
                        }
                        else {
                            document.getElementById('timer').innerHTML = `
        <div class="progress">
            <div class="inner"></div>
        </div>
        <p class="pi">${localeType === 'en' ? 'Waiting for the game to start...' : 'Ожидание старта игры...'}</p>
        `;
                        }
                    }
                })
        }

        window.manualGameLaunch = function () {
            if (isGameStart === false && authorId === id && onlineCount.online >= 2) {
                console.log('Socket connected:', socket.connected);
                socket.emit('requestStartGame');
            }
            if (onlineCount.online < 2) {
                Swal.fire({
                    text: localeType === 'en' ? 'Few players!' : 'Мало игроков!',
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
            if (isGameStart === true) {
                Swal.fire({
                    text: localeType === 'en' ? 'The game has already started!' : 'Игра уже началась!',
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
        }


        socket.on('startGame', () => {
            isGameStart = true;
            clearInterval(countdown);
            timeLeft = 10;
            startCountdown();
            console.log('Поехали!');
        })

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

        socket.on('updateLeaderBoard', (leaderBoard) => {
            const leaderB = document.getElementById('leaderBoard');

            if (leaderBoard && leaderBoard.length > 0) {
                leaderB.innerHTML = '';
                const fragment = document.createDocumentFragment();

                leaderBoard
                    .sort((a, b) => b.correct_answers - a.correct_answers)
                    .forEach((leader, index) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>#${index + 1}</td>
                            <td>${leader.name}</td>
                            <td>${leader.correct_answers}</td>
                            <td>${leader.time} ${localeType === 'en' ? 'Sec.' : 'Сек.'}</td>
                        `;
                        fragment.appendChild(tr);
                        if (index + 1 === 1) {
                            console.log('Первое место', leader.name);
                        }
                    });

                leaderB.appendChild(fragment);
            }
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
        <div style="display: block; margin-top: -10px;" title="${user.bannedName + ' | ' + user.bannedId}">
           <p>${user.bannedName}</p>
           <img src="${user.bannedImage}" style="margin-top: -14px;">
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

        socket.on('unbanBroadcast', (data) => {
            setTimeout(function () {
                socket.emit('requestBannedUsersCount');
            }, 500);
            Swal.fire({
                text: localeType === 'en' ? `Player ${data.userName} has been unbanned!` : `Игрок ${data.userName} разбанен!`,
                icon: "success",
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                customClass: {
                    popup: "small-alert"
                }
            });
        });

        socket.on('banBroadcast', (data) => {
            Swal.fire({
                text: localeType === 'en' ? `Player ${data.userName} banned!` : `Игрок ${data.userName} забанен!`,
                icon: "success",
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                customClass: {
                    popup: "small-alert"
                }
            });
        });

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