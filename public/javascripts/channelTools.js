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

function mediaMenu() {
    const checkIcon = document.getElementById('check-icon');
    const mediaBorder = document.getElementById('mediaBorder');

    if (checkIcon.checked) {
        mediaBorder.style.display = 'flex';

        mediaBorder.querySelector('.media-border').classList.remove('closeMediaMenu');
        mediaBorder.querySelector('.media-border').classList.add('openMediaMenu');

        document.querySelector('.chat-header').style.position = 'relative';
        document.querySelector('.chat-header').style.zIndex = '100';
    } else {
        mediaBorder.querySelector('.media-border').classList.remove('openMediaMenu');
        mediaBorder.querySelector('.media-border').classList.add('closeMediaMenu');

        setTimeout(() => {
            mediaBorder.style.display = 'none';
            document.querySelector('.chat-header').style.position = '';
            document.querySelector('.chat-header').style.zIndex = '1';
        }, 100);

    }
}

// window.addEventListener('resize', () => {
//     // console.log('mediaBorder', document.getElementById('mediaBorder').style.display === 'flex');
//     if (document.querySelector('.media-border').style.display === 'flex') {
//         console.log('height');
//         document.querySelector('.chat-messages').style.marginTop = document.querySelector('.chat-header').offsetHeight + 'px';
//     }
// });

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


function hasVerticalScrollbar() {
    return document.documentElement.scrollHeight > document.documentElement.clientHeight;
}

function disableScroll() {
    if (hasVerticalScrollbar()) {
        document.body.style.overflowY = 'hidden';
        document.documentElement.classList.add('scroll-bar-off');
    }
}

function enableScroll() {
    document.body.style.overflowY = '';
    document.documentElement.classList.remove('scroll-bar-off');
}