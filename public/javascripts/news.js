const searchContainer = document.getElementById('searchContainer');
const searchNotFound = document.getElementById('searchNotFound');

document.getElementById('searchInput').addEventListener('input', function() {
    const searchValue = this.value.trim().toLowerCase();
    const newsList = document.getElementById('newsList');
    const searchNews = newsList.getElementsByTagName('li');

    let foundVisible = false;

    Array.from(searchNews).forEach(news => {
        const newsTitleElement = news.querySelector('.news-title');

        const newsTitle = newsTitleElement ? newsTitleElement.textContent.toLowerCase() : '';

        if (newsTitle.includes(searchValue)) {
            showNews(news);
        }
        else {
            hideNews(news);
        }

        if (foundVisible) {
            searchNotFound.style.display = 'none';
            searchContainer.classList.remove('searchMode')
            // searchContainer.style.top = 'auto';
            // searchContainer.style.right = '10%';
        } else {
            searchNotFound.style.display = 'block';
            searchContainer.classList.add('searchMode')
            // searchContainer.style.top = '-5%';
            // searchContainer.style.right = '10%';
        }

        function showNews () {
            foundVisible = true;
            news.style.display = 'block';
        }

        function hideNews () {
            news.style.display = 'none';
        }
    });
});
document.getElementById('closeIcon').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    const newsList = document.getElementById('newsList');
    const searchNews = newsList.getElementsByTagName('li');
    Array.from(searchNews).forEach(news => {
        news.style.display = 'block';
        searchContainer.classList.remove('searchMode')
        // searchContainer.style.top = 'auto';
        // searchNotFound.style.display = 'none';
    });
})


function tagsRegulator () {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get('tag');
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