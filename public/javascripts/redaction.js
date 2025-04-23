const modals = [...Array(5)].map((_, i) => document.getElementById(`modal${i}`));
const inputs = [...Array(3)].map((_, i) => document.getElementById(`modal_input${i + 2}`));
const questions = [...Array(3)].map((_, i) => document.querySelector(`.question_${i + 2}`));
document.querySelector('select[name="game_max_questions"]').addEventListener('change', function () {
    const value = Number(this.value);
    console.log('value', value);

    modals.forEach((modal, i) => modal.hidden = i >= value);

    inputs.forEach((input, i) => input.required = i + 2 <= value && !modals[i + 2].hidden);
    questions.forEach((question, i) => question.required = i + 2 <= value && !modals[i + 2].hidden);
});

document.addEventListener('DOMContentLoaded', function () {
    const value = maxQuestions;

    modals.forEach((modal, i) => modal.hidden = i >= value);

    inputs.forEach((input, i) => input.required = i + 2 <= value && !modals[i + 2].hidden);
    questions.forEach((question, i) => question.required = i + 2 <= value && !modals[i + 2].hidden);
})

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (event) {
        document.querySelectorAll('input[required]').forEach(input => {
            if (input.hidden || input.offsetParent === null) {
                input.required = false;
            }
        });
    });
});


document.querySelectorAll('form').forEach(form => {
    form.addEventListener('keydown', event => {
        if (event.key === 'Enter') event.preventDefault();
    });
});
