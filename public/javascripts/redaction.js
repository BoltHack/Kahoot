document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});

function deleteQuestionMenu(gameId, questionId, questionNumber){
    document.getElementById('barrier').hidden = false;
    disableScroll();

    const deleteBorder = document.createElement('div');
    deleteBorder.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Delete question #${Number(questionNumber) + 1}?` : `Удалить вопрос #${Number(questionNumber) + 1} ?`}</h4>
        <div class="delete-modal">
            <button id="deleteQuestion">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="loading" hidden>${localeType === 'en' ? 'Loading...' : 'Загрузка...'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>`
    document.body.appendChild(deleteBorder);
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        document.body.removeChild(deleteBorder);
        document.getElementById('barrier').hidden = true;
        enableScroll();
    });

    document.getElementById('deleteQuestion').addEventListener('click', () => {
        fetch(`/delete-question/${gameId}/${questionId}`,{
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => {
                document.getElementById('deleteQuestion').hidden = true;
                document.getElementById('loading').hidden = false;
                if(response.ok){
                    setTimeout(function () {
                        window.location.reload();
                        return response.json();
                    }, 1000);
                } else {
                    console.log('Ошибка при загрузке.');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });
}