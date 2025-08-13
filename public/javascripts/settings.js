const barrier = document.getElementById('barrier');
document.addEventListener('DOMContentLoaded', function () {
    const editImageBtn = document.getElementById('editImageBtn');
    const editImage = document.getElementById('editImage');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const deleteImageBtn = document.getElementById('deleteImageBtn');

    const attachFile = document.getElementById('attachFile');
    const userImageView = document.getElementById('userImageView');

    editImageBtn.addEventListener('click', () => {
        editImage.hidden = false;
        barrier.hidden = false;
        document.body.style.overflowY = 'hidden';
    })
    barrier.addEventListener('click', () => {
        editImage.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    })


    attachFile.addEventListener('change', () => {
        let href = URL.createObjectURL(attachFile.files[0])
        userImageView.src = href;
    });

    saveImageBtn.addEventListener('click', () => {
        showToast('warning', localeType === 'en' ? 'Loading image...' : 'Загрузка изображения...');

        const formData = new FormData();
        console.log('formData', formData);
        const selectedFile = attachFile.files[0];
        formData.append('image', selectedFile);

        fetch('/changeAvatar',{
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: formData
        })
            .then(response => {
                if(response.ok){
                    console.log('Изображение успешно сохранено!');
                    showToast('success', localeType === 'en' ? 'Image saved successfully!' : 'Изображение успешно сохранено!');
                    setTimeout(function () {
                        window.location.href = '/settings';
                        return response.json();
                    }, 1000);
                } else {
                    showToast('error', localeType === 'en' ? 'No file selected.' : 'Файл не выбран.');
                    console.log('Ошибка при загрузке изображения');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    })

    deleteImageBtn.addEventListener('click', () => {
        fetch('/deleteAvatar',{
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
        })
            .then(response => {
                if(response.ok){
                    window.location.href = '/settings';
                    console.log('Изображение успешно удалено!');
                    return response.json();
                } else {
                    console.log('Ошибка при загрузке изображения');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    })

    function viewAvatar(){
        userImageView.src = settingImage;
    }
    viewAvatar();
});

function saveSettings() {
    showToast('success', localeType === 'en' ? 'Basic settings saved!' : 'Основные настройки сохранены!');
}


const editMainBackgroundBtn = document.getElementById('editMainBackgroundBtn');
const editMainMenu = document.getElementById('editMainMenu');
const mainBackgroundView = document.getElementById('mainBackgroundView');
const backgroundFile = document.getElementById('backgroundFile');
editMainBackgroundBtn.addEventListener('click', () => {
    editMainMenu.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';

    barrier.addEventListener('click', () => {
        editMainMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });

    backgroundFile.addEventListener('change', () => {
        let href = URL.createObjectURL(backgroundFile.files[0])
        mainBackgroundView.src = href;
    });
    document.getElementById('saveMainBackgroundBtn').addEventListener('click', () => {
        const formData = new FormData();
        const selectedFile = backgroundFile.files[0];
        formData.append('image', selectedFile);

        fetch('/changeBackgroundImage',{
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: formData
        })
            .then(response => {
                if(response.ok){
                    console.log('Изображение успешно сохранено!');
                    showToast('success', localeType === 'en' ? 'The main menu background has been changed!' : 'фон главного меню изменён!');
                    setTimeout(function () {
                        window.location.href = '/settings';
                        return response.json();
                    }, 1000);
                } else {
                    console.log('Ошибка при загрузке изображения');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });
    document.getElementById('deleteMainBackgroundBtn').addEventListener('click', () => {
        fetch('/deleteBackgroundImage',{
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
        })
            .then(response => {
                if(response.ok){
                    window.location.href = '/settings';
                    console.log('Изображение успешно удалено!');
                    showToast('success', localeType === 'en' ? 'Main menu background reset!' : 'фон главного меню сброшен!');
                    return response.json();
                } else {
                    console.log('Ошибка при загрузке изображения');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });
});

function viewImages(){
    mainBackgroundView.src = mainImage;
}
viewImages();


const editStatusBtn = document.getElementById('editStatusBtn');
const editStatusMenu = document.getElementById('editStatusMenu');

editStatusBtn.addEventListener('click', () => {
    editStatusMenu.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';
    maxStatusLength.textContent = `${status.value.length}/90`;

    barrier.addEventListener('click', () => {
        editStatusMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
});

document.getElementById('changeStatusBtn').addEventListener('click', () => {
    const status = document.getElementById('status');
    fetch('/changeStatus',{
        method: "POST",
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: `status=${encodeURIComponent(status.value)}`
    })
        .then(response => {
            if(response.ok){
                console.log('Статус успешно изменён!')
                changeSettings();
                setTimeout(function () {
                    window.location.href = '/settings';
                    return response.json();
                }, 1000);
            } else {
                console.log('Ошибка при загрузке изображения');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
});

const editAboutMeBtn = document.getElementById('editAboutMeBtn');
const editAboutMeMenu = document.getElementById('editAboutMeMenu');
editAboutMeBtn.addEventListener('click', () => {
    editAboutMeMenu.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';
    maxAboutMeLength.textContent = `${aboutMe.value.length}/200`;

    barrier.addEventListener('click', () => {
        editAboutMeMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
});
document.getElementById('changeAboutMeBtn').addEventListener('click', () => {
    const aboutMe = document.getElementById('aboutMe');
    fetch('/changeAboutMe',{
        method: "POST",
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: `aboutMe=${encodeURIComponent(aboutMe.value)}`
    })
        .then(response => {
            if(response.ok){
                changeSettings();
                setTimeout(function () {
                    window.location.href = '/settings';
                    return response.json();
                }, 1000);
            } else {
                console.log('Ошибка при загрузке изображения');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
});


const status = document.getElementById('status');
const maxStatusLength = document.getElementById('maxStatusLength');
status.addEventListener('input', () => {
    maxStatusLength.textContent = `${status.value.length}/90`;
});

const aboutMe = document.getElementById('aboutMe');
const maxAboutMeLength = document.getElementById('maxAboutMeLength');
aboutMe.addEventListener('input', () => {
    maxAboutMeLength.textContent = `${aboutMe.value.length}/200`;
});


function changeSettings() {
    showToast('success', localeType === 'en' ? 'Settings changed successfully!' : 'Настройки успешно изменены!');
}

let isVisible = false;

function togglePassword() {
    const pwd = document.getElementById('pwd');
    const cpwd = document.getElementById('cpwd');
    const eye = document.getElementById('tp');

    const hidePassword = localeType === 'en'? 'Hide password' : 'Скрыть пароль';
    const showPassword = localeType === 'en'? 'Show password' : 'Показать пароль';

    isVisible  = !isVisible ;

    pwd.type = isVisible ? 'text' : 'password';
    cpwd.type = isVisible ? 'text' : 'password';
    eye.innerText = isVisible ? hidePassword : showPassword;
}