const searchContainer = document.getElementById('searchContainer');
const searchNotFound = document.getElementById('searchNotFound');

const tags = JSON.parse(sessionStorage.getItem('tags') || '{}');
const windowParams = new URLSearchParams(window.location.search);

document.getElementById('searchInput').addEventListener('input', function() {
    const searchValue = this.value.trim().toLowerCase();
    const currentUrl = new URL(window.location.href);

    // const newsList = document.getElementById('newsList');
    // const searchNews = newsList.getElementsByTagName('li');
    const searchNews = document.querySelectorAll('#newsList li');

    let foundVisible = false;

    // const url = new URL(window.location.href);

    if (!searchValue) {
        currentUrl.searchParams.delete('searchNews');
        window.history.pushState({}, '', currentUrl);
        tags.searchNews = '';
    } else {
        tags.searchNews = searchValue;
        currentUrl.searchParams.set("searchNews", searchValue);
        window.history.replaceState({}, "", currentUrl);
    }
    sessionStorage.setItem('tags', JSON.stringify(tags));

    Array.from(searchNews).forEach(news => {
        const newsTitleElement = news.querySelector('.news-title');
        const newsSummaryElement = news.querySelector('.news-summary');

        const newsTitle = newsTitleElement ? newsTitleElement.textContent.toLowerCase() : '';
        const newsSummary = newsSummaryElement ? newsSummaryElement.textContent.toLowerCase() : '';

        if (newsTitle.includes(searchValue) || newsSummary.includes(searchValue)) {
            foundVisible = true;
            news.style.display = 'block';
        }
        else {
            news.style.display = 'none';
        }
    });
    searchNotFound.style.display = foundVisible ? 'none' : 'block';
});
document.getElementById('clearIcon').addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput');
    const currentUrl = new URL(window.location.href);

    searchInput.value = '';
    const newsList = document.getElementById('newsList');
    const searchNews = newsList.getElementsByTagName('li');
    Array.from(searchNews).forEach(news => {
        news.style.display = 'block';
        searchContainer.classList.remove('searchMode');
    });

    currentUrl.searchParams.delete('searchNews');
    window.history.pushState({}, '', currentUrl);

    tags.searchNews = '';
    sessionStorage.setItem('tags', JSON.stringify(tags));

    // searchInput.dispatchEvent(new Event('input', {bubbles: true}));
});


function tagsRegulator () {
    const tag = windowParams.get('tag');

    if (tag === 'Updates') {
        document.getElementById('Updates').classList.add('search-tag-active');
    }
    if (tag === 'AboutGame') {
        document.getElementById('AboutGame').classList.add('search-tag-active');
    }
    if (tag === 'BugsErrors') {
        document.getElementById('BugsErrors').classList.add('search-tag-active');
    }
    if (!tag) {
        document.getElementById('AllNews').classList.add('search-tag-active');
    }
    tags.tag = tag;
    tags.page = windowParams.get('page') || '1';
    sessionStorage.setItem('tags', JSON.stringify(tags));

}
tagsRegulator();


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

function checkSearchInputValue() {
    const referrer = document.referrer || window.location.pathname;
    const searchInput = document.getElementById('searchInput');

    if (!referrer.includes('/news')) {
        searchInput.value = '';
        tags.searchNews = '';
        sessionStorage.setItem('tags', JSON.stringify(tags));
    }
    if (tags.searchNews && tags.searchNews.length > 0) {
        searchInput.value = tags.searchNews;
        searchInput.dispatchEvent(new Event('input', {bubbles: true}));
    }
}

checkSearchInputValue();