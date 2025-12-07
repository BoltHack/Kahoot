const barrier = document.getElementById('barrier');

const userImageView = document.getElementById('userImageView');
const mainBackgroundView = document.getElementById('mainBackgroundView');
function viewImages(){
    userImageView.src = settingImage;
    mainBackgroundView.src = mainImage;
}
viewImages();

function saveSettings() {
    showToast('success', localeType === 'en' ? 'Basic settings saved!' : 'Основные настройки сохранены!');
}

let listenerController = false;

function editBackgroundImage(backgroundEditMenuId, backgroundViewId, backgroundFileId, backgroundSaveId, backgroundDeleteId, path) {
    const backgroundEditMenu = document.getElementById(backgroundEditMenuId);
    const backgroundView = document.getElementById(backgroundViewId);
    const backgroundFile = document.getElementById(backgroundFileId);
    const backgroundSave = document.getElementById(backgroundSaveId);
    const backgroundDelete = document.getElementById(backgroundDeleteId);

    backgroundEditMenu.hidden = false;
    barrier.hidden = false;
    disableScroll();

    backgroundEditMenu.querySelector('.close-btn').addEventListener('click', () => {
        backgroundEditMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
    barrier.addEventListener('click', () => {
        backgroundEditMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });

    backgroundFile.addEventListener('change', () => {
        let href = URL.createObjectURL(backgroundFile.files[0])
        backgroundView.src = href;
    });

    backgroundSave.addEventListener('click', () => {
        if (!listenerController) {
            const formData = new FormData();
            const selectedFile = backgroundFile.files[0];
            formData.append('image', selectedFile);

            fetch(path === 'avatarImage' ? '/changeAvatar/save' : '/changeBackgroundImage/save',{
                method: "POST",
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
            listenerController = true;
        }
    });

    backgroundDelete.addEventListener('click', () => {
        if (!listenerController) {
            fetch(path === 'avatarImage' ? '/changeAvatar/delete' : '/changeBackgroundImage/delete',{
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
            listenerController = true;
        }
    });
}


function editTextareaMenu(editMenuId, textareaId, maxLengthNumberId, saveBtnId, maxLength, path, type) {
    const editMenu = document.getElementById(editMenuId);
    const textarea = document.getElementById(textareaId);
    const maxLengthNumber = document.getElementById(maxLengthNumberId);
    const saveBtn = document.getElementById(saveBtnId);

    editMenu.hidden = false;
    barrier.hidden = false;
    disableScroll();
    maxLengthNumber.textContent = `${textarea.value.length}/${maxLength}`;

    barrier.addEventListener('click', () => {
        editMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
    editMenu.querySelector('.close-btn').addEventListener('click', () => {
        editMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });

    saveBtn.addEventListener('click', (e) => {
        if (!listenerController) {
            fetch(path,{
                method: "POST",
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                body: `${type}=${encodeURIComponent(textarea.value)}`
            })
                .then(response => {
                    if(response.ok){
                        console.log('Успешно изменено!')
                        changeSettings();
                        setTimeout(function () {
                            window.location.href = '/settings';
                            return response.json();
                        }, 1000);
                    } else {
                        console.log('Ошибка при отправлении данных');
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                });
            listenerController = true;
        }
    });
}


const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordMenu = document.getElementById('changePasswordMenu');
changePasswordBtn.addEventListener('click', () => {
    changePasswordMenu.hidden = false;
    barrier.hidden = false;
    disableScroll();

    changePasswordMenu.querySelector('.close-btn').addEventListener('click', () => {
        changePasswordMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
    barrier.addEventListener('click', () => {
        changePasswordMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
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
    disableScroll();

    deleteAccountMenu.querySelector('.close-btn').addEventListener('click', () => {
        deleteAccountMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
    barrier.addEventListener('click', () => {
        deleteAccountMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
});

document.getElementById('deleteAccount').addEventListener('click', (e) => {
    const deleteInput = document.getElementById('deleteInput');
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
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const eye = document.getElementById('tp');

    const hidePassword = localeType === 'en'? 'Hide password' : 'Скрыть пароль';
    const showPassword = localeType === 'en'? 'Show password' : 'Показать пароль';

    isVisible  = !isVisible ;

    newPassword.type = isVisible ? 'text' : 'password';
    confirmPassword.type = isVisible ? 'text' : 'password';
    eye.innerText = isVisible ? hidePassword : showPassword;
}