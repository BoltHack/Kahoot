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


function createSnowflake() {
    const snowflake = document.createElement("div");
    snowflake.innerHTML = "❄";
    snowflake.classList.add("snowflake");

    const size = Math.random() * 10 + 10 + "px";
    snowflake.style.fontSize = size;

    snowflake.style.left = Math.random() * window.innerWidth + "px";
    snowflake.style.animationDuration = Math.random() * 5 + 4 + "s";
    snowflake.style.opacity = Math.random();

    document.body.appendChild(snowflake);

    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}

setInterval(createSnowflake, 100);