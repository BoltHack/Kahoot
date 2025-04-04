const stickyContainer = document.getElementById('stickyContainer');
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
            foundVisible = true;
        }

        if (foundVisible) {
            stickyContainer.style.top = 'auto';
            stickyContainer.style.right = '10%';
        } else {
            hideNews(news);
            stickyContainer.style.top = '-5%';
            stickyContainer.style.right = '10.9%';
        }

        function showNews () {
            news.style.display = 'block';
            searchNotFound.style.display = 'none';
        }

        function hideNews () {
            news.style.display = 'none';
            searchNotFound.style.display = 'block';
        }
    });
});
document.getElementById('closeIcon').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    const newsList = document.getElementById('newsList');
    const searchNews = newsList.getElementsByTagName('li');
    Array.from(searchNews).forEach(news => {
        news.style.display = 'block';
        stickyContainer.style.top = 'auto';
    });
})