function previousPage() {
    const referrer = encodeURIComponent(document.referrer || window.location.pathname);
    document.cookie = `previousPage=${referrer}; max-age=${10 * 24 * 60 * 60}; path=/;`;
}
previousPage();