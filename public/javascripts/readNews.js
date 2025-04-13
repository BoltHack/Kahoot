const stickyHeight = document.getElementById('stickyHeight');
const body = document.body, html = document.documentElement;

const height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
stickyHeight.style.height = `calc(${height}px - 720px)`;

const copyLinkBtn = document.getElementById('copyLinkBtn');
copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        Swal.fire({
            text: localeType === 'en' ? 'Link copied to clipboard!' : 'Ссылка скопирована в буфер обмена!',
            icon: "success",
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            customClass: {
                popup: "small-alert"
            }
        });
    });
});