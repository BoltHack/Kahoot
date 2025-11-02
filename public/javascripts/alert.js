function generateRandomNumber() {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function successMenu(text) {
    const success = localeType === 'ru' ? 'Выполнено!' : 'Success!';
    const alert = document.createElement('div');

    alert.innerHTML = `
<div class="success-card" id="successCard">
  <svg class="success-wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
      fill-opacity="1"
    ></path>
  </svg>

  <div class="success-icon-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      stroke-width="0"
      fill="currentColor"
      stroke="currentColor"
      class="success-icon"
    >
      <path
        d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
      ></path>
    </svg>
  </div>
  <div class="success-message-text-container">
    <p class="success-message-text">${success}</p>
    <p class="success-sub-text">${text}</p>
  </div>
  <svg id="closeSuccessMenu"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    stroke-width="0"
    fill="none"
    stroke="currentColor"
    class="success-cross-icon"
  >
    <path
      fill="currentColor"
      d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
      clip-rule="evenodd"
      fill-rule="evenodd"
    ></path>
  </svg>
</div>
`

    document.body.appendChild(alert);

    setTimeout(() => {
        const successCard = document.getElementById('successCard');
        successCard.classList.add('back-show');
    }, 2000);
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 4000);

    document.getElementById('successCard').addEventListener('click', () => {
        const successCard = document.getElementById('successCard');
        successCard.classList.add('back-show');
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 2000);
    })
}
function errorMenu(text) {
    const error = localeType === 'ru' ? 'Ошибка!' : 'Error!';
    const alert = document.createElement('div');
    alert.innerHTML = `
<div class="error-card" id="errorCard">
  <svg class="error-wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
      fill-opacity="1"
    ></path>
  </svg>

  <div class="error-icon-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      stroke-width="0"
      fill="currentColor"
      stroke="currentColor"
      class="error-icon"
    >
      <path
        d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
      ></path>
    </svg>
  </div>
  <div class="error-message-text-container">
    <p class="error-message-text">${error}</p>
    <p class="error-sub-text">${text}</p>
  </div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    stroke-width="0"
    fill="none"
    stroke="currentColor"
    class="error-cross-icon"
  >
    <path
      fill="currentColor"
      d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
      clip-rule="evenodd"
      fill-rule="evenodd"
    ></path>
  </svg>
</div>

`
    document.body.appendChild(alert);

    setTimeout(() => {
        const errorCard = document.getElementById('errorCard');
        errorCard.classList.add('back-show');
    }, 2000);
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 4000);
}


function requestFriendMenu(requestData) {
    const alert = document.createElement('div');
    const randomNumbers = generateRandomNumber();
    const popupId = `successCard-${randomNumbers}`;
    const acceptAcceptId = `acceptRequest-${randomNumbers}`;
    const closeId = `closeMenu-${randomNumbers}`;
    const dataSenderId = requestData.senderId;
    const dataFriendId = requestData.friendId;

    alert.innerHTML = `
<div class="success-card" id="${popupId}">
  <svg class="success-wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
      fill-opacity="1"
    ></path>
  </svg>

  <div>
    <img class="success-icon-container" src="${requestData.senderImage}">
  </div>
  <div class="success-message-text-container">
    <p class="success-sub-text" style="font-size: 16px;">${localeType === 'en' ? `Friend request from ${requestData.senderName}` : `Запрос на дружбу от ${requestData.senderName}`}</p>
    <br>
    <span class="success-message-request">
        <a id="${acceptAcceptId}" class="accept-request" data-id="${requestData.friendId}" data-senderId="${requestData.senderId}">${localeType === 'en' ? 'Accept' : 'Принять'}</a>
        <a id="${closeId}" class="close-menu">${localeType === 'en' ? 'Reject' : 'Отклонить'}</a>
    </span>
  </div>
</div>
`

    document.body.appendChild(alert);

    const successCard = document.getElementById(popupId);
    const closeSuccessMenu = document.getElementById(closeId);

    closeSuccessMenu.addEventListener('click', () => {
        alreadyFriendAdd.splice(dataFriendId);
        successCard.classList.add('back-show');
        setTimeout(() => {
            if (closeSuccessMenu && closeSuccessMenu.parentNode) {
                document.parentNode.removeChild(alert);
            }
            else {
                document.body.removeChild(closeSuccessMenu);
            }
        }, 2000);
    })

    const acceptRequest = document.getElementById(acceptAcceptId);

    acceptRequest.addEventListener('click', () => {
        socket.emit('requestMyFriendsCount', dataSenderId);

        if (alreadyFriendAdd.includes(dataSenderId)) {
            Swal.fire({
                text: localeType === 'en' ? 'This player is already on your friends list.' : 'Данный игрок уже есть в вашем списке друзей.',
                icon: "error",
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                customClass: {
                    popup: "small-alert"
                }
            });
            successCard.classList.add('back-show');
            setTimeout(() => {
                if (alert && alert.parentNode) {
                    document.parentNode.removeChild(alert);
                }
                else {
                    document.body.removeChild(alert);
                }
            }, 2000);
        }
        else {
            alreadyFriendAdd.push(dataSenderId)
            console.log('acceptId', dataFriendId);
            socket.emit('acceptFriendRequest', { acceptData: { dataId: dataFriendId, senderId: dataSenderId } });

            setTimeout(function () {
                socket.emit('requestMyFriendsCount', dataSenderId);
            }, 500);

            successCard.classList.add('back-show');
            setTimeout(() => {
                if (alert && alert.parentNode) {
                    document.parentNode.removeChild(alert);
                }
                else {
                    document.body.removeChild(alert);
                }
            }, 2000);

            Swal.fire({
                text: localeType === 'en' ? 'Friend request accepted!' : 'Запрос на дружбу принят!',
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
    })
}



function inviteFriendMenu(data) {
    const alert = document.createElement('div');
    const randomNumbers = generateRandomNumber();
    const popupId = `inviteMenu-${randomNumbers}`;
    const closeId = `closeMenu-${randomNumbers}`;
    const acceptId = `acceptRequest-${randomNumbers}`;

    alert.innerHTML = `
<div class="success-card" id="${popupId}">
  <svg class="success-wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
      fill-opacity="1"
    ></path>
  </svg>

  <div>
    <img class="success-icon-container" src="${data.requestData.senderImage}">
  </div>
  <div class="success-message-text-container">
    <p class="success-sub-text" style="font-size: 16px;">${localeType === 'en' ? `${data.requestData.senderName} invites you to the game.` : `${data.requestData.senderName} приглашает вас в игру.`}</p>
    <br>
    <span class="success-message-request">
        <a id="${acceptId}" class="accept-request">${localeType === 'en' ? 'Accept' : 'Принять'}</a>
        <a id="${closeId}" class="reject-request">${localeType === 'en' ? 'Reject' : 'Отклонить'}</a>
    </span>
  </div>
</div>
`

    document.body.appendChild(alert);

    const successCard = document.getElementById(popupId);

    const acceptRequest = document.getElementById(acceptId);

    acceptRequest.addEventListener('click',  () => {
        socket.emit('requestAcceptInvite', {
            requestData: {
                senderId: data.requestData.senderId,
                friendId: data.requestData.friendId
            }});

        window.location.href = `/game/${data.requestData.gameId}`;
        sessionStorage.setItem('gamePage', 'false');

        successCard.classList.add('back-show');
        setTimeout(() => {
            if (alert && alert.parentNode) {
                document.parentNode.removeChild(alert);
            }
            else {
                document.body.removeChild(alert);
            }
        }, 2000);
    })


    const rejectRequest = document.getElementById(closeId);

    rejectRequest.addEventListener('click', () => {

        socket.emit('requestRejectInvite', {
            requestData: {
                senderId: data.requestData.senderId,
                friendId: data.requestData.friendId
            }});

        successCard.classList.add('back-show');
        setTimeout(() => {
            if (alert && alert.parentNode) {
                document.parentNode.removeChild(alert);
            }
            else {
                document.body.removeChild(alert);
            }
        }, 2000);
    })
}




function showAchievement() {
    challengeMusic.play();
    setTimeout(function () {
        challengeMusic.stop();
    }, 6000);

    const alert = document.createElement('div');
    alert.innerHTML = `
    <div id="achievement" class="achievement-popup">
        <span class="close" onclick="hideAchievement()">×</span>
        <div class="achievement-title">${localeType === 'en' ? 'Achieved achievement' : 'Получено достижение'} 🏆</div>
        <div class="achievement-description">${localeType === 'en' ? 'Achievement: Reached level 5' : 'Ачивка: Получи 5-й уровень'}</div>
    </div>

`
    document.body.appendChild(alert);

    setTimeout(() => {
        const achievementCard = document.getElementById('achievement');
        achievementCard.classList.add('show');
    }, 500);
}
function hideAchievement() {
    document.getElementById('achievement').classList.remove('show');
}




function showToast(type = 'success', message = '', duration = 3000) {
    const container = document.getElementById('toast-container');
    const randomNumbers = generateRandomNumber();
    const popupId = `${randomNumbers}`;

    const existing = Array.from(container.children).find(
        // toast => toast.dataset.message === message && toast.dataset.type === type
        toast => toast.dataset.id === popupId
    );
    // console.log('existing', existing);
    if (existing) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.id = popupId;
    toast.dataset.message = message;
    // console.log('toast.dataset.id', toast.dataset.id);

    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ban-icon lucide-ban"><path d="M4.929 4.929 19.07 19.071"/><circle cx="12" cy="12" r="10"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`
    };

    toast.innerHTML = `
<link rel="stylesheet" href="/stylesheets/alert.css">
    <div class="toast-icon">${icons[type] || ''}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = `fadeOut 0.4s ease forwards`;
        setTimeout(() => toast.remove(), 400);
    }, duration);
}