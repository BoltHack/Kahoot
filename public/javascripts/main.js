function findGame() {
    if (localStorage.getItem('token')) {
        const barrier = document.getElementById('barrier');
        const border = document.getElementById('border');
        const close = document.getElementById('close');

        barrier.hidden = false;
        border.hidden = false;
        document.body.style.overflow = 'hidden';

        barrier.addEventListener('click', () => {
            barrier.hidden = true;
            border.hidden = true;
        })
        close.addEventListener('click', () => {
            barrier.hidden = true;
            border.hidden = true;
        })
    }
    else {
        authMenu();
    }
}
document.getElementById('searchButton').addEventListener('click', () => {
    const infoInput = document.getElementById('infoInput').value;
    if (infoInput !== ''){
        window.location.href = `/game/${infoInput}`;
    }
})
sessionStorage.removeItem("redirectAfterReload");

const acceptCookiesFooter = document.getElementById('acceptCookiesFooter');
function acceptCookiesFunc(){
    acceptCookiesFooter.hidden = true;
    document.cookie = `acceptCookies=true; max-age=${10 * 365 * 24 * 60 * 60 * 1000}; path=/;`;
}

function checkCookie() {
    if (!cookiesType || (cookiesType !== 'true' && cookiesType !== 'false')){
        acceptCookiesFooter.hidden = false;
    }
    else{
        acceptCookiesFooter.hidden = true;
    }
}
checkCookie();


function redirectPage(page){
    const menus = JSON.parse(sessionStorage.getItem('menus') || '{}');
    if (localStorage.getItem('token')) {
        if (page === '/channels/@me') {
            menus.friendsContainerMenu = 'true';
            menus.addFriendMenu = 'false';
            sessionStorage.setItem('menus', JSON.stringify(menus));
            window.location.href = page;
        }
        else {
            window.location.href = page;
        }
    }
    else {
        authMenu();
    }
}

function MainMenuBackground() {
    if (mainImage) {
        document.body.style.backgroundImage = `url("${mainImage}")`;
    }
    else {
        document.body.style.backgroundImage = `url("/images/kahoot2.png")`;
    }
}
MainMenuBackground();