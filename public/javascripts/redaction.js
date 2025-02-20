document.querySelector('select[name="game_max_questions"]').addEventListener('change', function () {
    const modal0 = document.getElementById('modal0');
    const modal1 = document.getElementById('modal1');
    const modal2 = document.getElementById('modal2');
    const modal3 = document.getElementById('modal3');
    const modal4 = document.getElementById('modal4');

    const modal_input2 = document.getElementById('modal_input2');
    const modal_input3 = document.getElementById('modal_input3');
    const modal_input4 = document.getElementById('modal_input4');

    const question2 = document.querySelector('.question_2');
    const question3 = document.querySelector('.question_3');
    const question4 = document.querySelector('.question_4');
    const value = this.value;

    switch (value) {
        case '2':
            modal0.hidden = false;
            modal1.hidden = false;

            modal2.hidden = true;
            modal3.hidden = true;
            modal4.hidden = true;

            modal_input2.required = false;
            modal_input3.required = false;
            modal_input4.required = false;

            question2.required = false;
            question3.required = false;
            question4.required = false;
            break;
        case '3':
            modal0.hidden = false;
            modal1.hidden = false;
            modal2.hidden = false;
            modal_input2.required = true;
            question2.required = true;

            modal3.hidden = true;
            modal4.hidden = true;
            modal_input3.required = false;
            modal_input4.required = false;
            question3.required = false;
            question4.required = false;
            break;
        case '4':
            modal0.hidden = false;
            modal1.hidden = false;
            modal2.hidden = false;
            modal3.hidden = false;
            modal_input2.required = true;
            modal_input3.required = true;
            question2.required = true;
            question3.required = true;

            modal4.hidden = true;
            modal_input4.required = false;
            question4.required = false;
            break;
        case '5':
            modal0.hidden = false;
            modal1.hidden = false;
            modal2.hidden = false;
            modal3.hidden = false;
            modal4.hidden = false;
            modal_input2.required = true;
            modal_input3.required = true;
            modal_input4.required = true;
            question2.required = true;
            question3.required = true;
            question4.required = true;
            break;
        default:
            break;
    }
});

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});