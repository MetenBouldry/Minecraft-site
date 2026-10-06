fetch('lang/uk.json')
    .then(response => response.json())
    .then(data => {
        const titleWords = data.title.split(' ');
        const lastWord = titleWords.pop();
        document.getElementById('title').innerHTML = titleWords.join(' ') + ' <span class="red">' + lastWord + '</span>';

        const colored = data.subtitle.replace(/(ЛЮБЛЮ)/g, '<span class="red">$1</span>');
        document.getElementById('subtitle').innerHTML = colored;})
.catch(error => console.error('Error loading language file:', error));