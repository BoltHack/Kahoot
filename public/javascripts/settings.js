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
    editImage.querySelector('.close-btn').addEventListener('click', () => {
        editImage.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
    barrier.addEventListener('click', () => {
        editImage.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });


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

    editMainMenu.querySelector('.close-btn').addEventListener('click', () => {
        editMainMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
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

    editStatusMenu.querySelector('.close-btn').addEventListener('click', () => {
        editStatusMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
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

    editAboutMeMenu.querySelector('.close-btn').addEventListener('click', () => {
        editAboutMeMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
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

const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordMenu = document.getElementById('changePasswordMenu');
changePasswordBtn.addEventListener('click', () => {
    changePasswordMenu.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';

    changePasswordMenu.querySelector('.close-btn').addEventListener('click', () => {
        changePasswordMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
    barrier.addEventListener('click', () => {
        changePasswordMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
});

document.getElementById('changePassword').addEventListener('click', (e) => {
    e.preventDefault();


    let changePasswordInfo = {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    fetch('/auth/changePassword',{
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(changePasswordInfo)
    }).then(res => res.json())
        .then(data => {
            let {error, message} = data;
            if (error) {
                console.log('error', error);
                showToast('error', error);
            } else {
                showToast('success', message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
});


const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const deleteAccountMenu = document.getElementById('deleteAccountMenu');
deleteAccountBtn.addEventListener('click', () => {
    deleteAccountMenu.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';

    deleteAccountMenu.querySelector('.close-btn').addEventListener('click', () => {
        deleteAccountMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
    barrier.addEventListener('click', () => {
        deleteAccountMenu.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = 'auto';
    });
});

document.getElementById('deleteAccount').addEventListener('click', (e) => {
    const deleteInput = document.getElementById('deleteInput');
    if (deleteInput.value.length) {
        fetch('/auth/account-delete',{
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ deleteInput: deleteInput.value })
        }).then(res => res.json())
            .then(data => {
                let {error} = data;
                if (error) {
                    e.preventDefault();
                    deleteInput.value = '';
                    console.log('error', error);
                    showToast('error', error);
                } else {
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }
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