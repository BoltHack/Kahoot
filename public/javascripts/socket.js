const socket = io();

const gameId = game;
const userId = id;
const userName = name;

let countdown;
let timeLeft = 10;
let questions = document.getElementById('questions');
let refresh = document.getElementById('refresh');
let bc = document.getElementById('b-c');

const startCountdown = () => {
    countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
            document.getElementById('timer').innerHTML = '';
            questions.hidden = false;
            refresh.style.display = 'none';
            bc.style.top = '11%';
            checkReload();
            gameTimerStart();
            soundTrackAuto();
        } else {
            document.getElementById('timer').innerHTML = `<p class="timer">До начала игры: ${timeLeft}</p>`;
            timeLeft--;
        }
    }, 1000);
};


let gameTimerCooldown;
let gameTimer = Number(gamesExpiresInSeconds);
let gameStartTime;

const updateTimer = () => {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const remainingTime = Math.max(gameTimer - elapsedTime, 0);
    // console.log('gameTimer:', gameTimer);
    // console.log('elapsedTime:', Math.floor((Date.now() - gameStartTime) / 1000));

    if (elapsedTime >= gameTimer) {
        document.getElementById('gameTimer').innerHTML = '<p class="game-timer">0</p>';
        questions.hidden = true;
        console.log('Таймер завершен');
        fetch(`/user-leader/${gamesId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (response.ok)
                    console.log('ok');
            })
            .catch(error => {
                console.log('err', error);
            })
    }

    document.getElementById('gameTimer').innerHTML = `<p class="game-timer">${remainingTime}</p>`;

    if (remainingTime > 0) {
        gameTimerCooldown = setTimeout(updateTimer, 1000);
    }
};


const gameTimerStart = () => {
    gameStartTime = Date.now();
    updateTimer();
};


socket.on('updateUserCount', (onlineCount) => {
    document.getElementById('onlineCount').innerText = `Онлайн: ${onlineCount.online}`;
    const users = document.getElementById('usersCount');
    if (users && Array.isArray(onlineCount.users)) {
        users.innerHTML = onlineCount.users
            .map(user => `
<p>${JSON.stringify(user)}</p>
`)
            .join('');
    }

    if (onlineCount.online < 2) {
        questions.hidden = true;
        console.log('Онлайна мало');
        clearInterval(countdown);
        timeLeft = 10;
        document.getElementById('timer').innerHTML = `
        <div class="progress">
            <div class="inner"></div>
        </div>
        <p class="pi">Ожидание игроков...</p>
        `;
        bc.style.top = '2%';
        stopSound();
    }
    if (onlineCount.online >= 2) {
        clearInterval(countdown);
        timeLeft = 10;
        console.log('Поехали!');
        startCountdown();
    }

    if (sessionStorage.getItem("redirectAfterReload") === "true"){
        sessionStorage.removeItem("redirectAfterReload");
    }

    socket.on('redirect', (return_id) => {
        window.location.href = '/return-menu';
        localStorage.setItem('return_id', return_id);
    });

    socket.on('updateAnswersCount', (answersCount) => {
        document.getElementById('correctAnswersCount').innerHTML = `<span><p class="game_correct-answers">${answersCount[0].game_correct_answers || 0}</p> <p class="game_correct-answers-text">Правильных ответов</p></span>`;
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
                    const div = document.createElement('div');
                    div.innerHTML = `
                    <div class="color eerie-black">
                        #${index + 1} ${leader.name}
                        <span class="hex">|  Правильных ответов: ${leader.correct_answers}</span>
                    </div>
                `;
                    fragment.appendChild(div);
                });

            leaderB.appendChild(fragment);
        }
    });

});

socket.emit('joinGame', gameId, userId, userName);
