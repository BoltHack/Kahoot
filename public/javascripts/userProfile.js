socket.on('reloadOtherPage', async () => {
    console.log('reload');
    window.location.reload();
});

function achievementsListMenu() {
    const border = document.getElementById('achievementsListMenu');
    const barrier = document.getElementById('barrier');

    border.hidden = false;
    barrier.hidden = false;
    disableScroll();

    border.querySelector('.close-btn').addEventListener('click', () => {
        border.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
    barrier.addEventListener('click', () => {
        border.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
}

const findPlayer_input = document.getElementById('findPlayer_input');

findPlayer_input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        const username = findPlayer_input.value.trim();
        if (!username) return;

        try {
            const response = await fetch('/find-player', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ user_name: username })
            });

            const data = await response.json();

            if (data.error || !response.ok) {
                showToast('error', data.error || 'Произошла ошибка');
                findPlayer_input.value = '';
                return;
            }

            console.log('data', data.id);
            window.location.href = `/user-profile/${data.id}`;
        } catch (error) {
            console.log('response error', error);
        }
    }
});