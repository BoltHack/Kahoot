function openAnswerMenu(faqNumber) {
    const faqSection = document.querySelector(`#faqSection-${faqNumber}`).closest('.faq-section');
    const faqAnswer = faqSection.querySelector('.faq-answer');
    const faqOpen = faqSection.querySelector('.faq-open');

    if (faqAnswer.style.display === 'none' || faqAnswer.style.display === '') {
        faqAnswer.style.display = 'flex';
        faqOpen.innerHTML = '⎯';
    } else {
        faqAnswer.style.display = 'none';
        faqOpen.innerHTML = '+';
    }
}


function techChat() {
    if (localStorage.getItem('token')) {
        const techChatBtn = document.getElementById('techChatBtn');
        const loadingBtn = document.getElementById('loadingBtn');

        techChatBtn.hidden = true;
        loadingBtn.hidden = false;

        function requestTechSupport() {
            fetch('/requestTechSupport', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
            }).then(res => res.json())
                .then(data => {
                    const {error} = data;
                    if (error) {
                        techChatBtn.hidden = false;
                        loadingBtn.hidden = true;
                        showToast('error', error);
                        return;
                    }
                    techChatBtn.hidden = false;
                    loadingBtn.hidden = true;
                    if (data.id.toString() === sendId.toString()) {
                        showToast('error', localeType === 'en' ? 'Failed to contact technical support. Please try again later.' : 'Не удалось связаться с тех. поддержкой. Пожалуйста, повторите попытку чуть позже.');
                        console.log('Ничего не найдено.');
                        return;
                    }
                    checksChannel(`${data.id}`);
                }).catch(error => {
                techChatBtn.hidden = false;
                loadingBtn.hidden = true;
                console.log('error', error)
            })
        }
        requestTechSupport();
    } else {
        authMenu();
    }
}