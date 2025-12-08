const barrier = document.getElementById('barrier');

const sendReviewBtn = document.getElementById('sendReviewBtn');
const sendReviewMenu = document.getElementById('sendReviewMenu');
const maxReviewLength = document.getElementById('maxReviewLength');

const review = document.getElementById('review');
const grade = document.getElementById('grade');
sendReviewBtn.addEventListener('click', () => {
    if (!localStorage.getItem('token')) {
        authMenu();
        return;
    }

    sendReviewMenu.hidden = false;
    barrier.hidden = false;
    disableScroll();
    maxReviewLength.textContent = `${review.value.length}/1000`
    sendReviewMenu.querySelector('.close-btn').addEventListener('click', () => {
        sendReviewMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
    barrier.addEventListener('click', () => {
        sendReviewMenu.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
});
review.addEventListener('input', () => {
    maxReviewLength.textContent = `${review.value.length}/1000`
})

document.getElementById('sendReview').addEventListener('click', () => {
    fetch('/changeReview/save',{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review: review.value, grade: grade.value })
    }).then(res => res.json())
        .then(data => {
            let {error} = data;
            if (error) {
                console.log('error', error);
                showToast('error', error);
            } else {
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
});

document.getElementById('searchInput').addEventListener('input', function() {
    const searchValue = this.value.trim().toLowerCase();
    const reviewsList = document.getElementById('reviewsList');
    const searchNotFound = document.getElementById('searchNotFound');
    const searchReview = reviewsList.getElementsByTagName('li');

    let foundVisible = false;

    Array.from(searchReview).forEach(review => {
        const reviewNameElement = review.querySelector('.user-name');

        const reviewName = reviewNameElement ? reviewNameElement.textContent.toLowerCase() : '';

        if (reviewName.includes(searchValue)) {
            showReview(review);
        }
        else {
            hideReview(review);
        }

        if (document.body.offsetHeight <= 1800) {
            document.querySelector('.reviews-list').style.marginBottom = '400px';
        } else document.querySelector('.reviews-list').style.marginBottom = '0';

        if (foundVisible) {
            searchNotFound.style.display = 'none';
        } else {
            searchNotFound.style.display = 'block';
        }

        function showReview (review) {
            foundVisible = true;
            review.style.display = 'block';
        }

        function hideReview (review) {
            review.style.display = 'none';
        }

        document.getElementById('clearIcon').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('searchInput').dispatchEvent(new Event('input', {bubbles: true}));
        });

    });
});

document.getElementById('deleteReview').addEventListener('click', () => {
    const deleteMenu = document.createElement('div');
    const barrier = document.getElementById('barrier');

    deleteMenu.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Are you sure you want to delete your review?` : `Вы действительно хотите удалить свой отзыв?`}</h4>
        <div class="delete-modal">
            <button id="requestBtn">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>
`;
    barrier.hidden = false;
    sendReviewMenu.hidden = true;
    document.body.appendChild(deleteMenu);

    document.getElementById('requestBtn').addEventListener('click', () => {
        fetch('/changeReview/delete',{
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => res.json())
            .then(data => {
                let {error} = data;
                if (error) {
                    console.log('error', error);
                    showToast('error', error);
                } else {
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
        enableScroll();
    });
    barrier.addEventListener('click', () => {
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
        enableScroll();
    });
});