const barrier = document.getElementById('barrier');

const sendReviewBtn = document.getElementById('sendReviewBtn');
const sendReviewMenu = document.getElementById('sendReviewMenu');
sendReviewBtn.addEventListener('click', () => {
    if (!localStorage.getItem('token')) {
        authMenu();
        return;
    }

    sendReviewMenu.hidden = false;
    barrier.hidden = false;
    sendReviewMenu.querySelector('.close-btn').addEventListener('click', () => {
        sendReviewMenu.hidden = true;
        barrier.hidden = true;
    });
    barrier.addEventListener('click', () => {
        sendReviewMenu.hidden = true;
        barrier.hidden = true;
    });
});
document.getElementById('sendReview').addEventListener('click', () => {
    const review = document.getElementById('review').value;
    const grade = document.getElementById('grade').value;

    fetch('/sendReview',{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review, grade })
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

        if (foundVisible) {
            searchNotFound.style.display = 'none';
        } else {
            searchNotFound.style.display = 'block';
        }

        function showReview () {
            foundVisible = true;
            review.style.display = 'block';
        }

        function hideReview () {
            review.style.display = 'none';
        }

        document.getElementById('clearIcon').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            showReview();
        });

    });
});