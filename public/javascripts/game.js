document.addEventListener('DOMContentLoaded', () => {
    let gameTimerCooldown;
    let gameTimer = Number(gamesExpiresInSeconds);
    let gameStartTime;

    let currentQuestionIndex = 0;

    const cQuestion = document.querySelectorAll('.c-question');
    let questions = [];

    const time = document.querySelector('.main-timer');

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

        cQuestion.forEach(button => {
            button.addEventListener('click', function () {
                const dataNumber = Number(this.getAttribute('data-number'));
                const dataName = this.getAttribute('data-name');
                currentQuestionIndex = dataNumber;

                socket.emit('gameCheckAnswer', {
                    data: {
                        dataNumber: dataNumber,
                        dataName: dataName,
                    }
                });
            })
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
    checkQuestions();

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