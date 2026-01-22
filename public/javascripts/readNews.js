const stickyHeight = document.getElementById('stickyHeight');
const newsContainer = document.querySelector('.news-container');

const height = Math.max(newsContainer.scrollHeight, newsContainer.offsetHeight);

function setNewsContainerPosition() {
    stickyHeight.style.height = `${height}px`;
}
setNewsContainerPosition();

window.addEventListener('resize', () => {
    setNewsContainerPosition();
});

function likeNews(newsId) {
    console.log('like');
    socket.emit('requestLikeNews', newsId);
}
function dislikeNews(newsId) {
    console.log('dislike');
    socket.emit('requestDislikeNews', newsId);
}

socket.on('reactionsCount', async (data) => {
    console.log('type', data.type);
    const like = document.getElementById('like-' + data.newsId);
    const dislike = document.getElementById('dislike-' + data.newsId);

    const likesNumber = document.getElementById('likesNumber-' + data.newsId);
    const dislikesNumber = document.getElementById('dislikesNumber-' + data.newsId);

    const likeSvg = like.querySelector('svg');
    const dislikeSvg = dislike.querySelector('svg');

    if (data.type === 'like') {
        if (dislikeSvg.style.fill) {
            dislikeSvg.style.fill = '';
            dislikesNumber.innerText = Number(dislikesNumber.textContent) - 1;
        }
        likesNumber.innerText = Number(likesNumber.textContent) + 1;
        likeSvg.style.fill = '#A9A9B3';
        return;
    }
    if (data.type === 'dislike') {
        if (likeSvg.style.fill) {
            likeSvg.style.fill = '';
            likesNumber.innerText = Number(likesNumber.textContent) - 1;
        }
        dislikesNumber.innerText = Number(dislikesNumber.textContent) + 1;
        dislikeSvg.style.fill = '#A9A9B3';
    }
    else {
        if (likeSvg.style.fill) {
            likeSvg.style.fill = '';
            likesNumber.innerText = Number(likesNumber.textContent) - 1;
        }
        if (dislikeSvg.style.fill) {
            dislikeSvg.style.fill = '';
            dislikesNumber.innerText = Number(dislikesNumber.textContent) - 1;
        }
    }
});

function shareNews() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => {
            console.log('URL страницы успешно скопирован в буфер обмена!');
            showToast('success', localeType === 'en' ? 'The page address has been copied to the clipboard!' : 'Адрес страницы скопирован в буфер обмена!');
        })
        .catch(error => {
            console.log('error', error);
        })
}