document.addEventListener('DOMContentLoaded', function () {
    const togglePassword1 = document.getElementById('togglePassword1');
    const togglePassword2 = document.getElementById('togglePassword2');
    let passwordField = document.getElementById('pwd');
    let cPasswordField = document.getElementById('cpwd');
    let passwordFieldType = passwordField.getAttribute('type');
    togglePassword1.addEventListener('click', function () {
        if (passwordFieldType === 'password') {
            passwordField.setAttribute('type', 'text');
            cPasswordField.setAttribute('type', 'text');
            togglePassword2.hidden = false;
            togglePassword1.hidden = true;
        }
    })
    togglePassword2.addEventListener('click', function () {
        if (passwordFieldType === 'password') {
            passwordField.setAttribute('type', 'password');
            cPasswordField.setAttribute('type', 'password');
            togglePassword2.hidden = true;
            togglePassword1.hidden = false;
        }
    });

    const editImageBtn = document.getElementById('editImageBtn');
    const editImage = document.getElementById('editImage');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const deleteImageBtn = document.getElementById('deleteImageBtn');

    const attachFile = document.getElementById('attachFile');
    const userImageView = document.getElementById('userImageView');

    const barrier = document.getElementById('barrier');
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
        Swal.fire({
            text: localeType === 'en' ? 'Loading image...' : 'Загрузка изображения...',
            icon: "warning",
            position: "top-end",
            showConfirmButton: false,
            toast: true,
            customClass: {
                popup: "small-alert"
            }
        });

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
                    console.log('Изображение успешно сохранено!')
                    Swal.fire({
                        text: localeType === 'en' ? 'Image saved successfully!' : 'Изображение успешно сохранено!',
                        icon: "success",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
                    setTimeout(function () {
                        window.location.href = '/settings';
                        return response.json();
                    }, 1000);
                } else {
                    Swal.fire({
                        text: localeType === 'en' ? 'No file selected.' : 'Файл не выбран.',
                        icon: "error",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
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
    Swal.fire({
        text: localeType === 'en' ? 'Basic settings saved!' : 'Основные настройки сохранены!',
        icon: "success",
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
}



const editMainBackgroundBtn = document.getElementById('editMainBackgroundBtn');
const editMainMenu = document.getElementById('editMainMenu');
const barrier = document.getElementById('barrier');
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
                    console.log('Изображение успешно сохранено!')
                    Swal.fire({
                        text: localeType === 'en' ? 'The main menu background has been changed!' : 'фон главного меню изменён!',
                        icon: "success",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
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
                    Swal.fire({
                        text: localeType === 'en' ? 'Main menu background reset!' : 'фон главного меню сброшен!',
                        icon: "success",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
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

const changeLocale = document.getElementById('changeLocale');
changeLocale.addEventListener('change', () => {
    changeLocale.value === 'en' ? changeLocaleEn() : changeLocaleRu();
})

function changeSettings() {
    Swal.fire({
        text: localeType === 'en' ? 'Settings changed successfully!' : 'Настройки успешно изменены!',
        icon: "success",
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        customClass: {
            popup: "small-alert"
        }
    });
}