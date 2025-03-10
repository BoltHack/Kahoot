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


function createSymbolTop() {
    const symbol = document.createElement("div");
    // symbol.innerHTML = "❄";
    symbol.innerHTML = "|";
    symbol.classList.add("symbolTop");

    const size = Math.random() * 10 + 10 + "px";
    symbol.style.fontSize = size;

    symbol.style.left = Math.random() * window.innerWidth + "px";
    symbol.style.animationDuration = Math.random() * 5 + 4 + "s";
    symbol.style.opacity = Math.random();

    document.body.appendChild(symbol);

    setTimeout(() => {
        symbol.remove();
    }, 5000);
}

setInterval(createSymbolTop, 500);


function createSymbolBottom() {
    const symbol = document.createElement("div");
    // symbol.innerHTML = "❄";
    symbol.innerHTML = "|";
    symbol.classList.add("symbolBottom");

    const size = Math.random() * 10 + 10 + "px";
    symbol.style.fontSize = size;

    symbol.style.left = Math.random() * window.innerWidth + "px";
    symbol.style.animationDuration = Math.random() * 5 + 4 + "s";
    symbol.style.opacity = Math.random();

    document.body.appendChild(symbol);

    setTimeout(() => {
        symbol.remove();
    }, 5000);
}

setInterval(createSymbolBottom, 500);


function rulesMenu(){
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const rulesContainer = document.getElementById('rulesContainer');
    if (userInfo.rulesMenu === 'true') {
        rulesContainer.hidden = false;
    }
    else {
        rulesContainer.hidden = true;
    }
    document.getElementById('openRulesContainer').addEventListener('click', () => {
        if (userInfo.rulesMenu === 'true') {
            rulesContainer.hidden = true;
            userInfo.rulesMenu = 'false';
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
        else {
            rulesContainer.hidden = false;
            userInfo.rulesMenu = 'true';
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
    });
}
rulesMenu();