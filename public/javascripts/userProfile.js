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