function deleteMyChannel(channelId) {
    console.log('channelId', channelId);
    fetch(`/deleteMyChannel/${channelId}`,{
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
        },
    })
        .then(response => {
            if (response.ok) {
                const menus = JSON.parse(localStorage.getItem('menus') || '{}');
                console.log('Канал успешно удалён!');
                menus.addFriendMenu = 'false';
                menus.friendsContainerMenu = 'true';
                localStorage.setItem('menus', JSON.stringify(menus));
                window.location.href = '/channels/@me';
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function channelsMenu() {
    const channelsMenu = document.getElementById('channelsMenu');
    const closeChannelsMenu = document.getElementById('closeChannelsMenu');

    channelsMenu.style.display = 'block';

    closeChannelsMenu.addEventListener('click', () => {
        channelsMenu.style.display = 'none';
    });
}

function showCloseBtn(channelId) {
    const chatLink = document.querySelectorAll('.chat-link');
    chatLink.forEach(cSelect => {
        cSelect.querySelector('.del-companion').style.display = 'none';
    });

    const deleteBtn = document.getElementById('closeBtn-' + channelId);
    deleteBtn.querySelector('.del-companion').style.display = 'block';

    deleteBtn.addEventListener('mouseout', () => {
        deleteBtn.querySelector('.del-companion').style.display = 'none';
    });
}