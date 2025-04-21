document.addEventListener('DOMContentLoaded', () => {
    const cQuestion = document.querySelectorAll('.c-question');
    function checkQuestions() {
        const maxQuestions = Number(gameMaxQuestions);
        const questions = Array.from({ length: maxQuestions }, (_, i) => document.getElementById(`question-${i}`));
        questions[0].hidden = false;
        if (questions.some(question => question === null)) {
            console.error("Некоторые элементы вопросов не найдены!");
            return;
        }

        cQuestion.forEach(button => {
            button.addEventListener('click', function () {
                 const dataNumber = Number(this.getAttribute('data-number'));
                 const dataName = this.getAttribute('data-name');
                 const question = document.getElementById('question-'+dataNumber);
                 const time = document.querySelector('.game-timer');

                 setTimeout(function (){
                     socket.emit('requestAnswersCount');
                     }, 500);

                 if (dataNumber < questions.length - 1) {
                     setTimeout(function () {
                         questions[dataNumber + 1].hidden = false;
                         }, 500);
                 }

                 question.hidden = true;
                 socket.emit('gameCheckAnswer', {
                     data: {
                         dataNumber: dataNumber,
                         dataName: dataName,
                     }
                 });
                 socket.on('gameCorrectAnswer', () => {
                     successMenu(localeType === 'en' ? 'Correct answer!' : 'Правильный ответ!');
                 });
                 socket.on('gameWrongAnswer', () => {
                     wrongMenu(localeType === 'en' ? 'Wrong answer!' : 'Неверный ответ!');
                 });

                const leaderGameTime = gamesExpiresInSeconds - Number(time.textContent);
                const overlay = document.getElementById('overlay');
                const modal = document.querySelector('.modal');

                 setTimeout(function (){
                     if (maxQuestions === dataNumber + 1) {
                         document.getElementById('questions').hidden = true;
                         setInterval(function (){
                             socket.emit('requestLeadersCount');
                             }, 500);
                         stopSound();

                         overlay.classList.add('active');
                         modal.classList.add('active');

                         requestSent = true;

                         fetch(`/user-leader/${gamesId}/${leaderGameTime}`, {
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

                     } else {
                         console.log('пока победы нет', dataNumber + 1);
                     }}, 500);
            })
        });
    }
    checkQuestions();
});


function checkReload(){
    window.addEventListener("beforeunload", (event) => {
        sessionStorage.setItem("redirectAfterReload", "true");
        event.preventDefault();
    });

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
})