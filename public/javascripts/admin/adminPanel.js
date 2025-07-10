function addNewRole() {
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    editRole(email, role);
}

function deleteAdminMenu(email) {
    const deleteMenu = document.createElement('div');
    const barrier = document.getElementById('barrier');

    deleteMenu.innerHTML = `
    <div class="delete-border">
        <h4 style="text-align: center; color: white;">${localeType === 'en' ? `Remove ${email} from admin list?` : `Удалить ${email} из списка администрации?`}</h4>
        <div class="delete-modal">
            <button id="requestBtn">${localeType === 'en' ? 'Delete' : 'Удалить'}</button>
            <button id="closeDeleteBorder">${localeType === 'en' ? 'Cancel' : 'Отмена'}</button>
        </div>
    </div>`

    barrier.hidden = false;
    document.body.appendChild(deleteMenu);

    document.getElementById('requestBtn').addEventListener('click', () => {
        deleteAdmin(email);
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
    });
    document.getElementById('closeDeleteBorder').addEventListener('click', () => {
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
    });
    barrier.addEventListener('click', () => {
        barrier.hidden = true;
        document.body.removeChild(deleteMenu);
    });
}

function deleteAdmin(email) {
    editRole(email, 'User');
}

function editRole(email, role) {
    fetch(`/admin/add-role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
    }).then(res => res.json())
        .then(data => {
            const {error} = data;
            if (error) {
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
            }
            else {
                window.location.reload();
            }
        })
        .catch(error => {
            console.log('error', error)
        })
}

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});