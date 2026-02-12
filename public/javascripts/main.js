
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

function MainMenuBackground() {
    if (mainImage) {
        document.body.style.backgroundImage = `url("${mainImage}")`;
    }
    else {
        document.body.style.backgroundImage = `url("/images/kahoot2.png")`;
    }
}
MainMenuBackground();