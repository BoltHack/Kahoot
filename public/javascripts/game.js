let requestSent;
document.addEventListener('DOMContentLoaded', () => {
    let gameTimerCooldown = null;
    let gameTimer = Number(gamesExpiresInSeconds);
    let gameStartTime;

    requestSent = true;
    let maxQuestions = Number(gameMaxQuestions);

    const info = document.getElementById('info');
    const questions = document.getElementById('questions');
    const questionsDiv = document.getElementById('gameQuestions');
    const answersCount = document.querySelector('.answers-count');
    const wrongAnswerContainer = document.getElementById('wrongAnswerContainer');
    const correctAnswerContainer = document.getElementById('correctAnswerContainer');
    const timeIsUp = document.getElementById('timeIsUp');
    const overlay = document.getElementById('overlay');
    const waitAllPlayer = document.getElementById('waitAllPlayer');

    const leaderboard = document.querySelector('.leaderboard');
    const loader = document.querySelector('.loader');

    socket.on('startCountdown', async (timeLeft) => {
        console.log('timeLeft', timeLeft);
        info.textContent = localeType === 'en' ? `Before the game starts: ${timeLeft}` : `До начала игры: ${timeLeft}`;
        if (timeLeft <= 0) {
            info.textContent = '';
            checkReload();
            socket.emit('requestAnswersCount');
            console.log('Поехали!');
            setTimeout(() => {
                onTools();
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
            skipQuestion();
        }

        if (document.body.offsetWidth < 1000) {
            document.querySelector('.media-timer').textContent = remainingTime;
        } else {
            document.getElementById('gameTimer').querySelector('.game-timer').textContent = remainingTime;
        }
    };

    socket.on('updateGameCount', async (type) => {
        if (type === 'Wait') {
            checkQuestionsContainer();
            loader.style.display = 'none';
            waitAllPlayer.hidden = true;
            info.textContent =
                localeType === 'en' ? 'Waiting for the game to start...' : 'Ожидание старта игры...';
        } else if (type === 'Default') {
            console.log('Онлайна мало');
            checkQuestionsContainer();
            loader.style.display = 'none';
            waitAllPlayer.hidden = true;
            info.textContent =
                localeType === 'en' ? 'Waiting for players...' : 'Ожидание игроков...';
            stopSound();
            console.log('type', type);
        } else {
            loader.style.display = 'none';
        }
    });

    function checkQuestionsContainer() {
        if (questionsDiv.querySelector('.questions-container')) {
            questionsDiv.querySelector('.questions-container').remove();
            offTools();
            clearTimeout(gameTimerCooldown);
            window.removeEventListener("beforeunload", handler);
        }
    }

    socket.on('requestGetQuestions', async (gameQuestions) => {
        if (gameQuestions) {
            console.log('gameQuestions', true);
            questionsDiv.innerHTML = `
                <div id="question-${gameQuestions.question_number}" data-number="${gameQuestions.question_number}" class="questions-container">
                    <header>
                        <h2>${gameQuestions.question_title}</h2>
                    </header>
                    <div class="all-container">
                        <div class="all-container-settings">
                            <div class="img-container">
                            <img src="${gameQuestions.question_image}">
                        </div>
                        <br>
                        <br>
                        <div class="quest-container">
                            <div class="quest-container-btn-count">
                                <button class="c-question" style="background-color: #c1121f" data-name="${gameQuestions.question_1.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_1.title}</button>
                                <button class="c-question" style="background-color: #0077b6" data-name="${gameQuestions.question_2.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_2.title}</button>
                            </div>
                            <br>
                            <div class="quest-container-btn-count">
                                <button class="c-question" style="background-color: #ffc300" data-name="${gameQuestions.question_3.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_3.title}</button>
                                <button class="c-question" style="background-color: #008000" data-name="${gameQuestions.question_4.name}" data-number="${gameQuestions.question_number}">${gameQuestions.question_4.title}</button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>`
        } else {
            console.log('gameQuestions', false);
            offTools();
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

    function skipQuestion() {
        const questionsContainer = document.querySelector('.questions-container');
        const dataNumber = Number(questionsContainer.getAttribute('data-number'));
        console.log('skip id', dataNumber);
        socket.emit('skipQuestion', {
            dataNumber: dataNumber,
        });
    }

    socket.on('updateLeaderBoard', (leaderBoard) => {
        const leaderB = document.getElementById('leaderBoard');

        if (leaderBoard && leaderBoard.length > 0) {
            window.removeEventListener("beforeunload", handler);
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

    socket.on('updateBannedUsers', async (updateBannedUsers) => {
        if (updateBannedUsers) {
            const allBannedId = updateBannedUsers.find(b => b.bannedId === id);
            if (allBannedId) {
                window.removeEventListener("beforeunload", handler);
                const errorMsg = localeType === 'en' ? 'You have been disconnected from this game by an administrator.' : 'Вы были отключены от этой игры администратором.';
                window.location.assign(`/error?code=banned&message=${encodeURIComponent(errorMsg)}`);
            }
        }
    });


    function onTools() {
        questions.hidden = false;
        requestSent = false;
        waitAllPlayer.hidden = true;
        answersCount.style.display = 'block';
        soundTrackAuto();
        gameToolsPositionUpdate();
    }
    function offTools() {
        questionsDiv.innerHTML = '';
        questions.hidden = true;
        answersCount.style.display = 'none';
        requestSent = true;
        gameToolsPositionUpdate();
    }
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


function openBannedPlayersMenu() {
    const overlayBannedUsersMenu = document.getElementById('overlayBannedUsersMenu');
    const bannedPlayersMenu = document.getElementById('bannedPlayersMenu');

    if (authorId === id) {
        overlayBannedUsersMenu.classList.add('active');
        bannedPlayersMenu.classList.add('active');

        setTimeout(function () {
            socket.emit('requestBannedUsersCount');
        }, 500);
    }

    document.getElementById('closeBannedUsersMenu').addEventListener('click', () => {
        overlayBannedUsersMenu.classList.remove('active');
        bannedPlayersMenu.classList.remove('active');
    })
}



function openFriendListMenu () {
    const overlayFriendListMenu = document.getElementById('overlayFriendListMenu');
    const friendListMenu = document.getElementById('friendListMenu');

    overlayFriendListMenu.classList.add('active');
    friendListMenu.classList.add('active');

    setTimeout(function () {
        socket.emit('requestMyFriendsCount', id);
    }, 500);

    document.getElementById('closeFriendsMenu').addEventListener('click', () => {
        overlayFriendListMenu.classList.remove('active');
        friendListMenu.classList.remove('active');
    });
}

function mediaMenu() {
    const mediaBorder = document.getElementById('mediaBorder');
    const closeMediaBorder = document.getElementById('closeMediaBorder');

    mediaBorder.style.display = 'block';

    closeMediaBorder.addEventListener('click', () => {
        mediaBorder.style.display = 'none';
    });
}

window.addEventListener('resize', () => {
    usersCountPositionUpdate();
    gameToolsPositionUpdate();
});

window.addEventListener('load', () => {
    usersCountPositionUpdate();
});

function usersCountPositionUpdate() {
    const infoContainer = document.querySelector('.info-container');
    const usersCount = document.querySelector('.users-count');

    if (!infoContainer || !usersCount) return;

    if (document.body.offsetWidth < 1000) {
        if (infoContainer.children.length > 0) {
            usersCount.append(...infoContainer.childNodes);
        }
    } else {
        if (usersCount.children.length > 0) {
            infoContainer.append(...usersCount.childNodes);
        }
    }
}

function gameToolsPositionUpdate() {
    if (document.body.offsetWidth < 1000 && requestSent === false) {
        document.querySelector('.media-correct-answers').style.display = 'block';
        document.querySelector('.media-game-correct-answers-count').style.display = 'block';
        document.querySelector('.media-timer').style.display = 'block';
    } else {
        document.querySelector('.media-correct-answers').style.display = 'none';
        document.querySelector('.media-game-correct-answers-count').style.display = 'none';
        document.querySelector('.media-timer').style.display = 'none';
    }
}


function copyGameIdFunc(copyGameId) {
    navigator.clipboard.writeText(copyGameId)
        .then(() => {
            showToast('success', 'Код игры скопирован в буфер обмена!');
            console.log('id', copyGameId);
        })
        .catch(error => {
            console.log('Ошибка', error);
        })
}