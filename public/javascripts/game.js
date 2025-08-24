document.addEventListener('DOMContentLoaded', () => {
    let gameTimerCooldown;
    let gameTimer = Number(gamesExpiresInSeconds);
    let gameStartTime;

    let currentQuestionIndex = 0;

    let requestSent = false;
    let isGameStart = false;

    const gameQuestionsContainer = document.getElementById('gameQuestions');

    let questionsDiv = document.getElementById('questions');
    let refresh = document.getElementById('refresh');

    let questions = [];

    const time = document.querySelector('.main-timer');

    socket.on('startCountdown', async (timeLeft) => {
        console.log('timeLeft', timeLeft);
        document.getElementById('timer').innerHTML = `<span class="timer">${localeType === 'en' ? `<p class="beforeStart">Before the game starts</p><p class="timerLeft">${timeLeft}</p>` : `<p class="beforeStart">До начала игры</p><p class="timerLeft">${timeLeft}</p>`}</span>`;
        if (timeLeft <= 0) {
            document.getElementById('timer').innerHTML = '';
            checkReload();
            isGameStart = true;
            console.log('Поехали!');
            setTimeout(() => {
                questionsDiv.hidden = false;
                requestSent = false;
                refresh.style.display = 'none';
                startUpdateTimer();
                soundTrackAuto();
            }, 800);
        }
    });

    let gameStartUpdateTimer = Date.now();

    const updateTimer = () => {
        const elapsedTime = Math.floor((Date.now() - gameStartUpdateTimer) / 1000);

        // console.log('elapsedTime', elapsedTime, '|', 'requestSent', requestSent);

        document.getElementById('mainTimer').textContent = elapsedTime;

        if (requestSent === false) {
            setTimeout(updateTimer, 1000);
        } else {
            console.log('таймер остановлен');
        }
    };

    const startUpdateTimer = () => {
        gameStartUpdateTimer = Date.now();
        updateTimer();
    }

    socket.on('updateGameCount', async (type) => {
        if (type === 'Wait') {
            checkQuestionsContainer();
            document.getElementById('timer').innerHTML = `
                        <div class="progress">
                            <div class="inner"></div>
                        </div>
                        <p class="pi">${localeType === 'en' ? 'Waiting for the game to start...' : 'Ожидание старта игры...'}</p>
                    `;
        } else if (type === 'Default') {
            console.log('Онлайна мало');
            checkQuestionsContainer();
            document.getElementById('timer').innerHTML = `
                    <div class="progress">
                        <div class="inner"></div>
                    </div>
                    <p class="pi">${localeType === 'en' ? 'Waiting for players...' : 'Ожидание игроков...'}</p>
                `;
            stopSound();
            console.log('type', type);
        }
    });

    function checkQuestionsContainer() {
        if (document.getElementById('gameQuestions').querySelector('.questions-container')) {
            document.getElementById('gameQuestions').querySelector('.questions-container').remove();
            requestSent = true;
            questionsDiv.hidden = true;
            window.removeEventListener("beforeunload", handler);
        }
    }

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


    function checkQuestions() {
        const maxQuestions = Number(gameMaxQuestions);
        questions = Array.from({ length: maxQuestions }, (_, i) => document.getElementById(`question-${i}`));
        const validIndexes = questions
            .map((q, i) => q !== null ? i : Infinity);

        const minValidIndex = Math.min(...validIndexes);

        console.log('minValidIndex', minValidIndex);

        if (minValidIndex !== Infinity) {
            questions[minValidIndex].hidden = false;
        } else {
            console.error("Нет доступных вопросов");
        }
        if (questions.some(question => question === null)) {
            console.error("Некоторые элементы вопросов не найдены!");
            return;
        }

        socket.on('questionTimerStart', (updatedUser) => {
            console.log('updatedUser', updatedUser)
            const questionTimerStart = () => {
                gameStartTime = Date.now();
                if (gameTimerCooldown) {
                    clearTimeout(gameTimerCooldown);
                }
                console.log('maxQuestions !== updatedUser', maxQuestions,  updatedUser)
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

            // console.log('elapsedTime:', elapsedTime);
            console.log('remainingTime:', remainingTime);

            if (elapsedTime >= gameTimer) {
                console.log('Таймер завершен');
                clearTimeout(gameTimerCooldown);
                socket.emit('skipQuestion');
            }

            document.getElementById('gameTimer').innerHTML = `<p class="game-timer">${remainingTime}</p>`;
        };

        gameQuestionsContainer.addEventListener('click', function (e) {
            const button = e.target.closest('.c-question');
            if (!button) return;
            const dataNumber = Number(button.getAttribute('data-number'));
            const dataName = button.getAttribute('data-name');
            currentQuestionIndex = dataNumber;

            socket.emit('gameCheckAnswer', {
                data: {
                    dataNumber: dataNumber,
                    dataName: dataName,
                }
            });
        });

        const wrongAnswerContainer = document.getElementById('wrongAnswerContainer');
        const correctAnswerContainer = document.getElementById('correctAnswerContainer');
        const timeIsUp = document.getElementById('timeIsUp');

        function nextQuestion(currentIndex) {
            clearTimeout(gameTimerCooldown);
            userLeader(currentIndex);
            setTimeout(function (){
                socket.emit('requestAnswersCount');
            }, 500);
            questions[currentIndex].hidden = true;
            if (currentIndex < questions.length - 1) {
                currentQuestionIndex++;
                setTimeout(function () {
                    questions[currentIndex + 1].hidden = false;
                    wrongAnswerContainer.hidden = true;
                    correctAnswerContainer.hidden = true;
                    timeIsUp.hidden = true;
                }, 4000);
            }
        }

        function userLeader (currentIndex) {
            if (maxQuestions === currentIndex + 1) {
                const leaderGameTime = Number(time.textContent);
                const overlay = document.getElementById('overlay');
                const questions = document.getElementById('questions');
                const waitAllPlayer = document.getElementById('waitAllPlayer');
                const leaderboard = document.querySelector('.leaderboard');

                stopSound();
                waitAllPlayer.hidden = false;
                setTimeout(function () {
                    clearTimeout(gameTimerCooldown);
                }, 500)

                setTimeout(function () {
                    wrongAnswerContainer.hidden = true;
                    correctAnswerContainer.hidden = true;
                    timeIsUp.hidden = true;
                }, 3000);

                setTimeout(function () {
                    questions.hidden = true;
                    setTimeout(function () {
                        socket.emit('requestLeadersCount');
                    }, 1000);

                    socket.emit('userLeader', {
                        leaderData: {
                            gamesId: gamesId,
                            leaderGameTime: leaderGameTime
                        }
                    });
                })
                socket.on('openLeadersMenu', () => {
                    overlay.classList.add('active');
                    leaderboard.classList.add('active');
                    waitAllPlayer.hidden = true;
                });

            }
            else {
                console.log('пока победы нет', currentIndex + 1);
            }
        }

        socket.on('gameCorrectAnswer', () => {
            correctAnswerContainer.hidden = false;
            nextQuestion(currentQuestionIndex);
        });

        socket.on('gameWrongAnswer', () => {
            wrongAnswerContainer.hidden = false;
            nextQuestion(currentQuestionIndex);
        });

        socket.on('gameTimeIsUp', () => {
            timeIsUp.hidden = false;
            nextQuestion(currentQuestionIndex);
        });
    }

    socket.on('requestGetQuestions', async (gameQuestions) => {
        const setQuestions = document.getElementById('gameQuestions');
        if (setQuestions && Array.isArray(gameQuestions)) {
            setQuestions.innerHTML = gameQuestions
                .map(games => `
                <div id="question-${games.question_number}" data-number="${games.question_number}" class="questions-container" hidden>
                    <header>
                        <h2>${games.question_title}</h2>
                    </header>
                    <div class="all-container">
                        <div class="img-container">
                            <img src="${games.question_image}">
                        </div>
                        <br>
                        <br>
                        <div class="quest-container">
                            <div style="display: flex; gap: 10px;">
                                <button class="c-question" style="background-color: #c1121f" data-name="${games.question_1.name}" data-number="${games.question_number}">${games.question_1.title}</button>
                                <button class="c-question" style="background-color: #0077b6" data-name="${games.question_2.name}" data-number="${games.question_number}">${games.question_2.title}</button>
                            </div>
                            <br>
                            <div style="display: flex; gap: 10px;">
                                <button class="c-question" style="background-color: #ffc300" data-name="${games.question_3.name}" data-number="${games.question_number}">${games.question_3.title}</button>
                                <button class="c-question" style="background-color: #008000" data-name="${games.question_4.name}" data-number="${games.question_number}">${games.question_4.title}</button>
                            </div>
                        </div>
                    </div>
                </div>`).join('');}
        checkQuestions();
    });

    socket.on('challengeComplete1', async () => {
        console.log('challengeComplete1');
        setTimeout(showAchievement, 500)
    });

    socket.on('earlyCall-requestLeadersCount', async () => {
        socket.emit('requestLeadersCount');
    });

    socket.on('stopTimer', async () => {
        console.log('stopTimer');
        clearTimeout(gameTimerCooldown);
    });


    socket.on('updateBannedUsers', (bannedUsers) => {
        const getId = bannedUsers.map(doc => doc.bannedId);
        if (getId.includes(id)) {
            window.removeEventListener("beforeunload", handler);
            const kickMsg = localeType === 'en' ? 'You have been banned by the admin.' : 'Вы были забанены администатором.';
            window.location.assign(`/error?code=banned&message=${encodeURIComponent(kickMsg)}`);
        }
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