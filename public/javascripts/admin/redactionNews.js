const editor = document.getElementById('editor');

const newsId = editId;
console.log('newsId', newsId);

document.addEventListener("DOMContentLoaded", () => {
    let rawHTML = editContent;

    let cleanedHTML = rawHTML
        .replace(/<div>(?:\s|<br>|&nbsp;)*<\/div>/gi, '')
        .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
        .replace(/<br\s*\/?>/gi, '\n');


    editor.innerHTML = cleanedHTML;
});


function saveNewsFunc() {
    const mainTitle = document.getElementById('mainTitle').value;
    const mainSummary = document.getElementById('mainSummary').value;

    const updatesTag = document.getElementById('updatesTag').checked;
    const aboutGameTag = document.getElementById('aboutGameTag').checked;
    const bugsErrorsTag = document.getElementById('bugsErrorsTag').checked;

    const updateDate = document.getElementById('updateDate').checked;
    const isVisibility = document.getElementById('isVisibility').checked;
    const delImg = document.getElementById('delImg').checked;

    let contentHTML = editor.innerHTML;
    let contentText = contentHTML.replace(/<br\s*\/?>/gi, '\n');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentText;
    // const content = tempDiv.textContent || tempDiv.innerText || '';

    const container = document.createElement('div');
    container.innerHTML = editor.innerHTML;

    const orphanLis = [...container.querySelectorAll('li')].filter(li => !li.closest('ul, ol'));
    if (orphanLis.length > 0) {
        const ul = document.createElement('ul');
        orphanLis.forEach(li => ul.appendChild(li));
        container.appendChild(ul);
    }

    container.querySelectorAll('ul, ol').forEach(list => {
        if (!list.querySelector('li')) list.remove();
    });

    let cleanContent = container.innerHTML
        .replace(/>\s+</g, '><')
        .replace(/<br\s*\/?>/gi, '\n');

    const fileInput = document.getElementById('mainImage');

    if (fileInput && (fileInput.files[0] || delImg)) {
        console.log('delImg', delImg);
        const formData = new FormData();

        if (fileInput.files[0]) formData.append('file', fileInput.files[0]);

        formData.append('newsId', newsId);
        formData.append('delImg', delImg);

        fetch('/admin/post-image/withoutJson', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка при загрузке файла');
                return response.json();
            })
            .then(data => {
                console.log('Файл успешно отправлен!', data);
            })
            .catch(err => {
                console.error('Ошибка:', err);
            });
    }

    fetch(`/admin/redaction-news`, {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            newsId,
            mainTitle,
            mainSummary,
            updatesTag,
            aboutGameTag,
            bugsErrorsTag,
            updateDate,
            isVisibility,
            content: cleanContent
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.log('error', data.error);
            } else {
                console.log('success');
                window.location.reload();
            }
        })
        .catch(console.error);
}


editor.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();

        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement('br');
        const textNode = document.createTextNode('\u200B');

        range.insertNode(br);
        range.collapse(false);
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);

        console.log('Автоматический пробел');
    }

    if (event.key === 'Backspace' || event.keyCode === 0) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;

        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;

            const charBefore = text[offset - 1];

            if (charBefore === '\u200B') {
                // event.preventDefault();
                console.log('Двойной Backspace');
                const newText = text.slice(0, offset) + text.slice(offset);
                node.nodeValue = newText;

                const newRange = document.createRange();
                newRange.setStart(node, offset - 1);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        }
    }
});


const inputFile = document.getElementById('inputFile');

inputFile.addEventListener('input', () => {
    const file = inputFile.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('newsId', newsId);

    console.log('value', inputFile.files[0].name);

    fetch('/admin/post-image/default',{
        method: "POST",
        body: formData
    }).then(res => res.json())
        .then(data => {
            let {error, fileName} = data;
            if (error) {
                console.log('error', error);
            } else {
                console.log('message', fileName);

                const newImg = document.createElement('div');

                newImg.textContent = `<img src="${fileName}">`;

                editor.appendChild(newImg);
                inputFile.value = '';
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });

});