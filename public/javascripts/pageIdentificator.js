function previousPage() {
    const referrer = encodeURIComponent(document.referrer || 'http://localhost:3000');
    document.cookie = `previousPage=${referrer}; max-age=${10 * 24 * 60 * 60}; path=/;`;
}
previousPage();