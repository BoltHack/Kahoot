function openAnswerMenu(faqNumber) {
    const faqSection = document.querySelector(`#faqSection-${faqNumber}`).closest('.faq-section');
    const faqAnswer = faqSection.querySelector('.faq-answer');
    const faqOpen = faqSection.querySelector('.faq-open');

    // if (faqAnswer.style.display === 'none' || faqAnswer.style.display === '') {
    //     document.querySelectorAll('.faq-section').forEach(e => {
    //         e.querySelector('.faq-answer').style.display = 'none';
    //         e.querySelector('.faq-open').innerHTML = '+';
    //     });
    //     setTimeout(() => {
    //         faqAnswer.style.display = 'flex';
    //         faqOpen.innerHTML = '⎯';
    //     }, 50);
    // } else {
    //     faqAnswer.style.display = 'none';
    //     faqOpen.innerHTML = '+';
    // }

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
        let initialText = localeType === 'en' ? 'Message' : 'Написать';

        techChatBtn.disabled = true;
        techChatBtn.textContent = 'Загрузка...';

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
                        techChatBtn.disabled = false;
                        techChatBtn.textContent = initialText;
                        showToast('error', error);
                        return;
                    }
                    if (data.id.toString() === sendId.toString()) {
                        showToast('error', localeType === 'en' ? 'Failed to contact technical support. Please try again later.' : 'Не удалось связаться с тех. поддержкой. Пожалуйста, повторите попытку чуть позже.');
                        console.log('Ничего не найдено.');
                        techChatBtn.disabled = false;
                        techChatBtn.textContent = initialText;
                        return;
                    }
                    checksChannel(`${data.id}`);
                }).catch(error => {
                techChatBtn.disabled = true;
                techChatBtn.disabled = 'Загрузка...';
                console.log('error', error);
            })
        }
        requestTechSupport();
    } else {
        authMenu();
    }
}