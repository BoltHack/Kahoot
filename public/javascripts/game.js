document.addEventListener('DOMContentLoaded', () => {
    let gameTimerCooldown = null;
    let gameTimer = Number(gamesExpiresInSeconds);
    let gameStartTime;

    let requestSent = false;
    let maxQuestions = Number(gameMaxQuestions);

    const info = document.getElementById('info');
    const questions = document.getElementById('questions');
    const questionsDiv = document.getElementById('gameQuestions');
    const wrongAnswerContainer = document.getElementById('wrongAnswerContainer');
    const correctAnswerContainer = document.getElementById('correctAnswerContainer');
    const timeIsUp = document.getElementById('timeIsUp');
    const overlay = document.getElementById('overlay');
    const waitAllPlayer = document.getElementById('waitAllPlayer');

    const leaderboard = document.querySelector('.leaderboard');
    const time = document.querySelector('.main-timer');

    console.log('time', time);

    socket.on('startCountdown', async (timeLeft) => {
        console.log('timeLeft', timeLeft);
        info.textContent = localeType === 'en' ? `Before the game starts: ${timeLeft}` : `До начала игры: ${timeLeft}`;
        if (timeLeft <= 0) {
            info.textContent = '';
            checkReload();
            socket.emit('requestAnswersCount');
            console.log('Поехали!');
            setTimeout(() => {
                questionsDiv.hidden = false;
                questions.hidden = false;
                requestSent = false;
                soundTrackAuto();
            }, 800);
        }
    });

    socket.on('questionTimerStart', (updatedUser) => {
        console.log('updatedUser', updatedUser)
        const questionTimerStart = () => {
            gameStartTime = Date.now();
            if (gameTimerCooldown) {
                clearTimeout(gameTimerCooldown);
            }
            if (maxQuestions !== updatedUser) {
                questionTimer();
            }
        };
        questionTimerStart();
    });
    const questionTimer = () => {
        gameTimerCooldown = setTimeout(questionTimer, 1000);
        const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const remainingTime = Math.max(gameTimer - elapsedTime, 0);

        console.log('remainingTime:', remainingTime);

        if (elapsedTime >= gameTimer) {
            console.log('Таймер завершен');
            clearTimeout(gameTimerCooldown);
            socket.emit('skipQuestion');
        }

        document.getElementById('gameTimer').querySelector('.game-timer').textContent =
            remainingTime;
    };

    socket.on('updateGameCount', async (type) => {
        if (type === 'Wait') {
            checkQuestionsContainer();
            info.textContent =
                localeType === 'en' ? 'Waiting for the game to start...' : 'Ожидание старта игры...';
        } else if (type === 'Default') {
            console.log('Онлайна мало');
            checkQuestionsContainer();
            info.textContent =
                localeType === 'en' ? 'Waiting for players...' : 'Ожидание игроков...';
            stopSound();
            console.log('type', type);
        }
    });

    function checkQuestionsContainer() {
        if (questionsDiv.querySelector('.questions-container')) {
            questionsDiv.querySelector('.questions-container').remove();
            requestSent = true;
            questions.hidden = true;
            clearTimeout(gameTimerCooldown);
            window.removeEventListener("beforeunload", handler);
        }
    }

    socket.on('requestGetQuestions', async (gameQuestions) => {
        console.log('gameQuestions', gameQuestions);
        if (gameQuestions) {
            questionsDiv.innerHTML = `
                <div id="question-${gameQuestions.question_number}" data-number="${gameQuestions.question_number}" class="questions-container">
                    <header>
                        <h2>${gameQuestions.question_title}</h2>
                    </header>
                    <div class="all-container">
                        <div class="img-container">
                            <img src="${gameQuestions.question_image}">
                        </div>
                        <br>
                        <br>
                        <div class="quest-container">
                            <div style="display: flex; gap: 10px;">
                                <button class="c-question" style="background-color: #c1121f" data-name="${gameQuestions.question_1.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_1.title}</button>
                                <button class="c-question" style="background-color: #0077b6" data-name="${gameQuestions.question_2.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_2.title}</button>
                            </div>
                            <br>
                            <div style="display: flex; gap: 10px;">
                                <button class="c-question" style="background-color: #ffc300" data-name="${gameQuestions.question_3.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_3.title}</button>
                                <button class="c-question" style="background-color: #008000" data-name="${gameQuestions.question_4.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_4.title}</button>
                            </div>
                        </div>
                    </div>
                </div>`
            console.log('setQuestions', questionsDiv);
        } else {
            questionsDiv.innerHTML = '';
            questions.hidden = true;
            waitAllPlayer.hidden = false;
        }
    });
    const gameQuestionsContainer = document.getElementById('gameQuestions');
    gameQuestionsContainer.addEventListener('click', function (e) {
        const button = e.target.closest('.c-question');
        if (!button) return;
        button.disabled = true;
        const dataNumber = Number(button.getAttribute('data-number'));
        const dataName = button.getAttribute('data-name');
        console.log('dataNumber', dataNumber, 'dataName', dataName);

        socket.emit('gameCheckAnswer', {
            dataNumber: dataNumber,
            dataName: dataName,
        });
    });

    socket.on('updateLeaderBoard', (leaderBoard) => {
        const leaderB = document.getElementById('leaderBoard');

        if (leaderBoard && leaderBoard.length > 0) {
            leaderB.innerHTML = '';
            const fragment = document.createDocumentFragment();

            leaderBoard
                .sort((a, b) => b.correct_answers - a.correct_answers)
                .forEach((leader, index) => {
                    const winner = document.getElementById('winner');
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
                        winner.textContent = localeType === 'en' ? `Winner: ${leader.name}` : `🏆 Победитель: ${leader.name}`;
                        setTimeout(() => {
                            const footer = document.querySelector('.leaderboard-footer');
                            footer.classList.add('active');
                        }, 500);
                    }
                });

            leaderB.appendChild(fragment);
        }
    });

    socket.on('gameCorrectAnswer', () => {
        correctAnswerContainer.hidden = false;
        setTimeout(() => {
            correctAnswerContainer.hidden = true;
        }, 4000);
    });

    socket.on('gameWrongAnswer', () => {
        wrongAnswerContainer.hidden = false;
        setTimeout(() => {
            wrongAnswerContainer.hidden = true;
        }, 4000);
    });

    socket.on('gameTimeIsUp', () => {
        timeIsUp.hidden = false;
        setTimeout(() => {
            timeIsUp.hidden = true;
        }, 4000);
    });

    socket.on('stopTimer', async () => {
        console.log('stopTimer');
        clearTimeout(gameTimerCooldown);
    });

    socket.on('openLeadersMenu', () => {
        overlay.classList.add('active');
        leaderboard.classList.add('active');
        waitAllPlayer.hidden = true;
    });
});

let handler;

function checkReload(){
    handler = (event) => {
        sessionStorage.setItem("redirectAfterReload", "true");
        event.preventDefault();
        event.returnValue = '';
    };

    window.addEventListener("beforeunload", handler);
}

window.addEventListener("DOMContentLoaded", function () {
    if (sessionStorage.getItem("redirectAfterReload") === "true") {
        setTimeout(function (){
            window.location.replace("/");
        }, 500);
    }
});

const music = new Howl({
    src: ['/soundtracks/lobby-classic-game.mp3'],
    loop: true,
    volume: 0.5
});

const challengeMusic = new Howl({
    src: ['/soundtracks/challenge_complete.mp3'],
    loop: true,
    volume: 0.5
});

function soundTrackAuto(){
    if (sounds === 'on'){
        startSound();
    }
    else{
        stopSound();
    }
}

function startSound(){
    music.play();
}
function stopSound(){
    music.stop();
}

function checkGamePermissions(){
    if (!sessionStorage.getItem('gamePage') || sessionStorage.getItem('gamePage') === 'false'){
        sessionStorage.setItem('gamePage', 'true');
        window.location.reload();
    }
}
checkGamePermissions();

if (authorId === id) {
    const overlayBannedUsersMenu = document.getElementById('overlayBannedUsersMenu');
    const bannedPlayersMenu = document.getElementById('bannedPlayersMenu');
    document.getElementById('openBannedPlayersMenu').addEventListener('click', () => {
        overlayBannedUsersMenu.classList.add('active');
        bannedPlayersMenu.classList.add('active');
        setTimeout(function () {
            socket.emit('requestBannedUsersCount');
        }, 500);
    })

    document.getElementById('closeBannedUsersMenu').addEventListener('click', () => {
        overlayBannedUsersMenu.classList.remove('active');
        bannedPlayersMenu.classList.remove('active');
    })
}


const overlayFriendListMenu = document.getElementById('overlayFriendListMenu');
const friendListMenu = document.getElementById('friendListMenu');
document.getElementById('openFriendListMenu').addEventListener('click', () => {
    overlayFriendListMenu.classList.add('active');
    friendListMenu.classList.add('active');
    setTimeout(function () {
        socket.emit('requestMyFriendsCount', id);
    }, 500);
})

document.getElementById('closeFriendsMenu').addEventListener('click', () => {
    overlayFriendListMenu.classList.remove('active');
    friendListMenu.classList.remove('active');
});