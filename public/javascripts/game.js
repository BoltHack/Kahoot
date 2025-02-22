document.addEventListener('DOMContentLoaded', () => {
    const cQuestion = document.querySelectorAll('.c-question');

    fetch(`/getData/${gameId}`, {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            let {gameQuestions} = data;

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

                        setTimeout(function (){
                            socket.emit('requestAnswersCount');
                        }, 500);

                        if (dataNumber < questions.length - 1) {
                            questions[dataNumber + 1].hidden = false;
                        }

                        if (gameQuestions[dataNumber].correct_question === dataName){
                            question.hidden = true;
                            successMenu('Правильный ответ!');
                            fetch(`/game-correct-users/${id}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                            })
                                .then(response => {
                                    if (response.ok)
                                        console.log('ok')
                                })
                                .catch(error => {
                                    console.log('err', error)
                                })
                        } else {
                            question.hidden = true;
                            wrongMenu('Неверный ответ!');
                            fetch(`/game-users/${id}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                            })
                                .then(response => {
                                    if (response.ok)
                                        console.log('ok')
                                })
                                .catch(error => {
                                    console.log('err', error)
                                })
                        }

                        setTimeout(function (){
                            if (maxQuestions === dataNumber + 1) {
                                setInterval(function (){
                                    socket.emit('requestLeadersCount');
                                }, 500);
                                document.getElementById('questions').hidden = true;
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
                            } else {
                                console.log('пока победы нет', dataNumber + 1);
                            }
                        }, 500);
                    })

                });
            }
            checkQuestions();

        });
})


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