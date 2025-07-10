function getCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

function changeLocaleRu() {
    document.body.style.cursor = 'wait';
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
                window.location.reload();
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
    document.body.style.cursor = 'wait';
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
                window.location.reload();
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

function languageConfirmation () {
    const lc = getCookie('lc');
    if (!lc || lc !== 'true'){
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;
                document.cookie = `ip=${ip}; max-age=${10 * 24 * 60 * 60}; path=/;`;
                if (ip) {
                    setTimeout(async function () {
                        let response = await fetch('/languageConfirmation', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'}
                        })

                        if (response.ok) {
                            console.log('response', response);
                            if(response.status === 200) {
                                setTimeout(function () {
                                    changeLocaleRu();
                                }, 500);
                            } else {
                                setTimeout(function () {
                                    changeLocaleEn()
                                }, 500);
                            }
                            document.cookie = `lc=true; max-age=${10 * 24 * 60 * 60}; path=/;`;
                        } else {
                            console.log('Ошибка:', response.status);
                        }
                    }, 500);
                }
            })
    }
}
languageConfirmation();