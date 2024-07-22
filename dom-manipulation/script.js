document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const exportQuotesBtn = document.getElementById('exportQuotes');
    const importFile = document.getElementById('importFile');
    const categoryFilter = document.getElementById('categoryFilter');
    const notification = document.createElement('div');

    notification.id = 'notification';
    notification.style.display = 'none';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.padding = '10px';
    notification.style.backgroundColor = '#ff9800';
    notification.style.color = '#fff';
    notification.style.borderRadius = '5px';
    document.body.appendChild(notification);

    let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

    const serverQuotesUrl = 'https://jsonplaceholder.typicode.com/posts'; // Replace with actual server URL

    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function populateCategories() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        const filteredQuotes = selectedCategory === 'all'
            ? quotes
            : quotes.filter(quote => quote.category === selectedCategory);
        displayQuotes(filteredQuotes);
        localStorage.setItem('selectedCategory', selectedCategory);
    }

    function displayQuotes(quotesToDisplay) {
        quoteDisplay.innerHTML = '';
        quotesToDisplay.forEach(quote => {
            const p = document.createElement('p');
            p.textContent = `"${quote.text}" - ${quote.category}`;
            quoteDisplay.appendChild(p);
        });
    }

    function showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
        sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
    }

    function addQuote() {
        const quoteText = newQuoteText.value.trim();
        const quoteCategory = newQuoteCategory.value.trim();

        if (quoteText && quoteCategory) {
            quotes.push({ text: quoteText, category: quoteCategory });
            saveQuotes();
            newQuoteText.value = '';
            newQuoteCategory.value = '';
            alert('Quote added successfully!');
            populateCategories();
            filterQuotes();
        } else {
            alert('Please enter both quote text and category.');
        }
    }

    function exportQuotes() {
        const quotesJson = JSON.stringify(quotes);
        const blob = new Blob([quotesJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            alert('Quotes imported successfully!');
            populateCategories();
            filterQuotes();
        };
        fileReader.readAsText(event.target.files[0]);
    }

    async function fetchServerQuotes() {
        try {
            const response = await fetch(serverQuotesUrl);
            const serverQuotes = await response.json();
            return serverQuotes.map(q => ({ text: q.title, category: 'Server' })); // Adjust as per actual server response
        } catch (error) {
            console.error('Error fetching server quotes:', error);
            return [];
        }
    }

    async function syncWithServer() {
        const serverQuotes = await fetchServerQuotes();
        const newQuotes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
        if (newQuotes.length > 0) {
            quotes.push(...newQuotes);
            saveQuotes();
            notification.textContent = 'New quotes have been added from the server!';
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
            populateCategories();
            filterQuotes();
        }
    }

    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportQuotesBtn.addEventListener('click', exportQuotes);
    importFile.addEventListener('change', importFromJsonFile);

    populateCategories();
    filterQuotes();

    const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
    if (lastQuote) {
        quoteDisplay.textContent = `"${lastQuote.text}" - ${lastQuote.category}`;
    } else {
        showRandomQuote();
    }

    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
        filterQuotes();
    }

    syncWithServer();
    setInterval(syncWithServer, 20000); // Sync with server every 20 seconds
});
