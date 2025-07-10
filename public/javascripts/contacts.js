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
                        Swal.fire({
                            text: error,
                            icon: "error",
                            position: "top-end",
                            timer: 4000,
                            showConfirmButton: false,
                            toast: true,
                            customClass: {
                                popup: "small-alert"
                            }
                        });
                        return;
                    }
                    techChatBtn.hidden = false;
                    loadingBtn.hidden = true;
                    if (data.id.toString() === sendId.toString()) {
                        requestTechSupport();
                        console.log('Ещё раз...');
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