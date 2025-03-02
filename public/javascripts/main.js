function findGame() {
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