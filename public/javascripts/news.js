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
        }
        else {
            hideNews(news);
        }

        if (foundVisible) {
            // console.log('foundVisible 1', foundVisible);
            searchNotFound.style.display = 'none';
            stickyContainer.style.top = 'auto';
            stickyContainer.style.right = '10%';
        } else {
            // console.log('foundVisible 2', foundVisible);
            searchNotFound.style.display = 'block';
            stickyContainer.style.top = '-5%';
            stickyContainer.style.right = '10.9%';
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
        stickyContainer.style.top = 'auto';
        searchNotFound.style.display = 'none';
    });
})