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