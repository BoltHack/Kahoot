const stickyHeight = document.getElementById('stickyHeight');
const body = document.body, html = document.documentElement;

const height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
stickyHeight.style.height = `calc(${height}px - 880px)`;