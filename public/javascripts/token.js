async function accessToken() {
    try {
        const res = await fetch('/checkToken', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await res.json();
        if (data.token && data.token !== localStorage.getItem('token')) {
            localStorage.setItem('token', data.token);
        }
    } catch (err) {
        console.error('Ошибка при обновлении токена:', err);
    }
}
accessToken();