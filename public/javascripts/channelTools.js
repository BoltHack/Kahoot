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
                window.location.href = '/channels/@me';
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}