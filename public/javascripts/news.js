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
            searchContainer.style.top = 'auto';
            searchContainer.style.right = '10%';
        } else {
            searchNotFound.style.display = 'block';
            searchContainer.style.top = '-5%';
            searchContainer.style.right = '10%';
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
        searchContainer.style.top = 'auto';
        searchNotFound.style.display = 'none';
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