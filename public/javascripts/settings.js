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
            // timer: 4000,
            showConfirmButton: false,
            toast: true,
            customClass: {
                popup: "small-alert"
            }
        });

        const formData = new FormData();
        const selectedFile = attachFile.files[0];
        formData.append('image', selectedFile);

        fetch(`/changeAvatar/${settingId}`,{
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
                    console.log('Ошибка при загрузке изображения');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    })

    deleteImageBtn.addEventListener('click', () => {
        fetch(`/deleteAvatar/${settingId}`,{
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
const defaultBackground = document.getElementById('defaultBackground');
const settings = JSON.parse(localStorage.getItem('settings') || '{}');
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
        defaultBackground.hidden = true;
        mainBackgroundView.hidden = false;
        let href = URL.createObjectURL(backgroundFile.files[0])
        mainBackgroundView.src = href;
    });
    document.getElementById('saveMainBackgroundBtn').addEventListener('click', () => {
        const reader = new FileReader();
        reader.readAsDataURL(backgroundFile.files[0]);
        reader.onload = function () {
            const imageDataUrl = reader.result;
            settings.mainMenuBackground = imageDataUrl
            localStorage.setItem('settings', JSON.stringify(settings));
            editMainMenu.hidden = true;
            barrier.hidden = true;
            document.body.style.overflowY = 'auto';

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
        };
    });
    document.getElementById('deleteMainBackgroundBtn').addEventListener('click', () => {
        settings.mainMenuBackground = null;
        localStorage.setItem('settings', JSON.stringify(settings));
        editMainMenu.hidden = true;
        barrier.hidden = true;
        defaultBackground.hidden = false;
        mainBackgroundView.hidden = true;
        document.body.style.overflowY = 'auto';

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
    });
});

function viewMainBackground(){
    if (!settings.mainMenuBackground) {
        mainBackgroundView.hidden = true;
        defaultBackground.hidden = false;
    }
    else {
        mainBackgroundView.src = settings.mainMenuBackground;
    }
}
viewMainBackground();


const changeLocale = document.getElementById('changeLocale');
changeLocale.addEventListener('change', () => {
    changeLocale.value === 'en' ? changeLocaleEn() : changeLocaleRu();
})

const socket = io();