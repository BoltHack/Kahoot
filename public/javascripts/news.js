const stickyContainer = document.getElementById('stickyContainer');

document.getElementById('searchInput').addEventListener('input', function() {
    const searchValue = this.value.trim().toLowerCase();
    const newsList = document.getElementById('newsList');
    const searchNews = newsList.getElementsByTagName('li');

    let foundVisible = false;

    Array.from(searchNews).forEach(news => {
        const newsTitleElement = news.querySelector('.news-title');

        const newsTitle = newsTitleElement ? newsTitleElement.textContent.toLowerCase() : '';

        // newsTitle.includes(searchValue) ? showNews() : hideNews();

        if (newsTitle.includes(searchValue)) {
            showNews(news);
            foundVisible = true;
        }
        else {
            hideNews(news);
        }

        if (foundVisible) {
            stickyContainer.style.top = 'auto';
            stickyContainer.style.right = '10%';
        } else {
            stickyContainer.style.top = '-5%';
            stickyContainer.style.right = '10.9%';
        }

        function showNews () {
            console.log('show');
            news.style.display = 'block';
        }

        function hideNews () {
            console.log('hide');
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
    });
})