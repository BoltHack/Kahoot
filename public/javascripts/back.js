function pages(){
    const pageName = document.getElementById('pageName');
    const page = window.location.pathname;

    if (page.startsWith('/create-game')){
        pageName.innerHTML = `
<a class="between"> > </a>
<a class="other-color">${localeType === 'en' ? 'Game creation' : 'Создание игры'}</a>`
    } else if (page.startsWith('/redaction')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a href="/my-games" class="color-btn">${localeType === 'en' ? 'My games' : 'Мои игры'}</a>
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'Editor' : 'Редактор'}</a>`
    }
    else if (page.startsWith('/my-games')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'My games' : 'Мои игры'}</a>`
    }
    else if (page.startsWith('/friends')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'My friends' : 'Мои друзья'}</a>`
    }
    else if (page.startsWith('/support')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'Support' : 'Поддержка'}</a>`
    }
    else if (page.startsWith('/privacyPolicy')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'Privacy policy' : 'Политики конфиденциальности'}</a>`
    }
    else if (page.startsWith('/rules')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'Terms of use' : 'Политика использования'}</a>`
    }
    else if (page.startsWith('/aboutUs')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'About us' : 'О нас'}</a>`
    }
    else if (page.startsWith('/news')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'News' : 'Новости'}</a>`
    }
    else if (page.startsWith('/read-news')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a href="/news" class="color-btn">${localeType === 'en' ? 'News' : 'Новости'}</a>
            <a class="between"> > </a>
            <a class="other-color">${newsTitle}</a>`
    }
    else if (page.startsWith('/admin/admin-panel')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>`
    }
    else if (page.startsWith('/admin/user-contacts')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'User contacts' : 'Список контактов'}</a>`
    }
    else if (page.startsWith('/admin/list-news')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'News list' : 'Список новостей'}</a>`
    }
    else if (page.startsWith('/admin/post-news')) {
        pageName.innerHTML = `
            <a class="between"> > </a>
            <a href="/admin/admin-panel" class="color-btn">${localeType === 'en' ? 'Admin panel' : 'Админ панель'}</a>
            <a class="between"> > </a>
            <a class="other-color">${localeType === 'en' ? 'Post news' : 'Разместить новость'}</a>`
    }
    else if (page === '/') {
        document.getElementById('back').style.display = 'none';
    }
}
pages();