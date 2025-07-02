function deleteGameMenu(gameId) {
    console.log('gameId', gameId);

    const barrier = document.getElementById('barrier');

    const deleteBorder = document.createElement('div');
    barrier.hidden = false;
    deleteBorder.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Are you sure you want to delete this game?` : `Вы уверены, что хотите удалить эту игру?`}</h4>
        <div class="delete-modal">
            <button id="requestBtn">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>`
    document.body.appendChild(deleteBorder);

    document.getElementById('requestBtn').addEventListener('click', () => {
        fetch(`/delete-game/${gameId}`, {
            method: 'POST'
        })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                }
            })
            .catch(error => {
                console.log('error', error);
            })
    });
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        document.body.removeChild(deleteBorder);
        barrier.hidden = true;
    });
    barrier.addEventListener('click', () => {
        document.body.removeChild(deleteBorder);
        barrier.hidden = true;
    })
}