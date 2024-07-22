document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const exportQuotesBtn = document.getElementById('exportQuotes');
    const importFile = document.getElementById('importFile');
    const categoryFilter = document.getElementById('categoryFilter');

    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
        { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Inspirational" },
        { text: "The way to get started is to quit talking and begin doing.", category: "Motivational" },
        { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
    ];

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
});
