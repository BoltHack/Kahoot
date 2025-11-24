socket.on('reloadOtherPage', async () => {
    console.log('reload');
    window.location.reload();
});

function achievementsListMenu() {
    const border = document.getElementById('achievementsListMenu');
    const barrier = document.getElementById('barrier');

    border.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';

    border.querySelector('.close-btn').addEventListener('click', () => {
        border.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
    barrier.addEventListener('click', () => {
        border.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
}