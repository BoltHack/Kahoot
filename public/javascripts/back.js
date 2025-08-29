function pages(){
    const pageName = document.getElementById('pageName');
    const page = window.location.pathname;
    const tags = JSON.parse(sessionStorage.getItem('tags') || '{}');

    if (page.startsWith('/create-game')){
        pageName.innerHTML = `
<a class="between"> ❯ </a>
<a class="other-color">${localeType === 'en' ? 'Game creation' : 'Создание игры'}</a>`
    } else if (page.startsWith('/redaction')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/my-games" class="color-btn">${localeType === 'en' ? 'My games' : 'Мои игры'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Editor' : 'Редактор'}</a>`
    } else if (page.startsWith('/create-questions')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/my-games" class="color-btn">${localeType === 'en' ? 'My games' : 'Мои игры'}</a>
            <a class="between"> ❯ </a>
            <a href="/redaction/${roomId}" class="color-btn">${localeType === 'en' ? 'Editor' : 'Редактор'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'New question' : 'Новый вопрос'}</a>`
    } else if (page.startsWith('/edit-question')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/my-games" class="color-btn">${localeType === 'en' ? 'My games' : 'Мои игры'}</a>
            <a class="between"> ❯ </a>
            <a href="/redaction/${roomId}" class="color-btn">${localeType === 'en' ? 'Editor' : 'Редактор'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? `Question #${Number(questionNumber) + 1}` : `Вопрос #${Number(questionNumber) + 1}`}</a>`
    }
    else if (page.startsWith('/my-games')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'My games' : 'Мои игры'}</a>`
    }
    else if (page.startsWith('/friends')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'My friends' : 'Мои друзья'}</a>`
    }
    else if (page.startsWith('/support')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Support' : 'Поддержка'}</a>`
    }
    else if (page.startsWith('/privacyPolicy')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Privacy policy' : 'Политики конфиденциальности'}</a>`
    }
    else if (page.startsWith('/rules')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Terms of use' : 'Политика использования'}</a>`
    }
    else if (page.startsWith('/aboutUs')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'About us' : 'О нас'}</a>`
    }
    else if (page.startsWith('/contacts')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Contacts' : 'Контакты'}</a>`
    }
    else if (page.startsWith('/reviews')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Reviews' : 'Отзывы'}</a>`
    }
    else if (page.startsWith('/about-donates')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Assistance to the project' : 'Помощь проекту'}</a>`
    }
    else if (page.startsWith('/news')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'News' : 'Новости'}</a>`
    }
    else if (page.startsWith('/read-news')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="${tags.tag ? `/news?page=${tags.page + '&tag=' + tags.tag}` : tags.page ? `/news?page=${tags.page}` : '/news'}" class="color-btn">${localeType === 'en' ? 'News' : 'Новости'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${newsTitle.length > 50 ? newsTitle.slice(0, 50) + '...' : newsTitle}</a>`
    }
    else if (page.startsWith('/admin/admin-panel')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>`
    }
    else if (page.startsWith('/admin/list-users')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'List of players' : 'Список игроков'}</a>`
    }
    else if (page.startsWith('/admin/user-contacts')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'User contacts' : 'Список контактов'}</a>`
    }
    else if (page.startsWith('/admin/list-news')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'News list' : 'Список новостей'}</a>`
    }
    else if (page.startsWith('/admin/post-news')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Post news' : 'Разместить новость'}</a>`
    }
    else if (page.startsWith('/admin/redaction-news')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> ❯ </a>
            <a href="/admin/list-news" class="color-btn">${localeType === 'en' ? 'List news' : 'Список новостей'}</a>
            <a class="between"> ❯ </a>
            <a class="other-color">${editNews.length > 50 ? editNews.slice(0, 50) + '...' : editNews}</a>`
    }
    else if (page.startsWith('/user-profile/')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? `Profile ${userName}` : `Профиль ${userName}`}</a>`
    }
    else if (page.startsWith('/settings')) {
        pageName.innerHTML = `
            <a class="between"> ❯ </a>
            <a class="other-color">${localeType === 'en' ? 'Settings' : 'Настройки'}</a>`
    }
    else if (page === '/') {
        document.getElementById('back').style.display = 'none';
    }
}
pages();