if (effects === 'on') {
    function createSymbolTop() {
        const symbol = document.createElement("div");
        // symbol.innerHTML = "❄";
        const randomSymbol = Math.floor(Math.random() * 2);
        symbol.innerHTML = randomSymbol === 0 ? '|' : ',';
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
        const randomSymbol = Math.floor(Math.random() * 2);
        symbol.innerHTML = randomSymbol === 0 ? '|' : ',';
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
}