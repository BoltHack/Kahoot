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

// const params = new URLSearchParams(window.location.search);
// socket.emit('requestNewsInfo', {
//     newsInfo: {
//         page: params.get('page') || '1',
//         tag: params.get('tag') || ''
//     }
// });
//
// socket.on('updateNewsCount', async (allNews, renderData) => {
//     console.log('news', renderData);
//     console.log('allNews', allNews);
//     const container = document.getElementById('newsCount');
//     if (Array.isArray(allNews) && allNews.length > 0) {
//         container.innerHTML = allNews
//             .map(news => `
//                 <li class="news-container">
//                     <article class="news-card">
//                         <h2 class="news-title">${news.updateTitle}</h2>
//                         <div class="news-meta">
//                             <div class="news-author">
//                                 <span>Автор</span>
//                                 <img src="data:image/png;base64,${news.author?.authorImage || ''}">
//                                 <span>${news.author?.authorName || 'Неизвестно'}</span>
//                             </div>
//                             <span class="news-date">📅 ${news.date}</span>
//                             <div class="tags">
//                                 ${news.tags?.map(tag => `
//                                     <div class="tag">
//                                         ${tag.tagName === 'Updates' ? 'Обновления' :
//                 tag.tagName === 'AboutGame' ? 'Об игре' :
//                     tag.tagName === 'BugsErrors' ? 'Баги/Ошибки' : 'Все новости'}
//                                     </div>
//                                 `).join('')}
//                             </div>
//                         </div>
//                         <div class="news-image">
//                             ${news.update?.[0]?.image ? `<img src="data:image/png;base64,${news.update[0].image}">` : ''}
//                         </div>
//                         <p class="news-summary">
//                             ${news.update?.[0]?.content?.length > 100
//                 ? news.update[0].content.slice(0, 100) + '...'
//                 : news.update?.[0]?.content || ''}
//                         </p>
//                         <div class="news-footer">
//                             <div class="stats">
//                                 <span style="font-size: 25px; font-weight: 600">&#128065;</span>
//                                 <p style="margin-top: 11.5px;">${news.views}</p>
//                             </div>
//                             <form action="/viewNews/${news._id}" method="POST">
//                                 <button class="read-more">Читать полностью</button>
//                             </form>
//                         </div>
//                     </article>
//                 </li>
//             `).join('');
//     } else {
//         container.innerHTML = `<p style="text-align: center;">Ничего не найдено.</p>`;
//     }
// });


// function tagRegulator (tag) {
//     const params = new URLSearchParams(window.location.search);
//     const page = params.get('page');
//     console.log('tag', tag);
//
//     if (window.location.search.startsWith('?page')) {
//         window.location.href = `?page=${page}&tag=${tag}`;
//     }
//     else {
//         window.location.href = `?tag=${tag}`;
//     }
// }