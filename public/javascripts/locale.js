function changeLocaleRu() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const homeId = userInfo.id;
    const token = localStorage.getItem('token');
    const url = token ? `/changeLocalAuth/${homeId}/ru` : '/changeLocal/ru';
    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
        },
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            }
            else {
                response.json().then(errorMessage => {
                    console.log("Ошибка: " + errorMessage);
                });
            }
        })
        .catch(error => {
            console.log('Произошла ошибка при отправке запроса:', error);
            console.log("Произошла ошибка при отправке запроса: " + error.message);
        });
}

function changeLocaleEn() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const homeId = userInfo.id;
    const token = localStorage.getItem('token');
    const url = token ? `/changeLocalAuth/${homeId}/en` : '/changeLocal/en';
    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
        },
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            }
            else {
                response.json().then(errorMessage => {
                    console.log("Ошибка: " + errorMessage);
                });
            }
        })
        .catch(error => {
            console.log('Произошла ошибка при отправке запроса:', error);
            console.log("Произошла ошибка при отправке запроса: " + error.message);
        });
}