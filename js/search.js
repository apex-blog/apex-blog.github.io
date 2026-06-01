// Toggle Search Modal
window.toggleSearch = function () {
    const overlay = document.getElementById('search-overlay');
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchData = [];

    Promise.all([
        fetch('/search.xml').then(res => res.text()).then(str => new window.DOMParser().parseFromString(str, "text/xml")),
        fetch('/authors.json').then(res => res.ok ? res.json() : [])
    ])
        .then(([xmlData, authorsJson]) => {
            // Parse Posts
            const posts = xmlData.getElementsByTagName('entry');
            const postItems = Array.from(posts).map(post => ({
                type: 'post',
                title: post.getElementsByTagName('title')[0].textContent,
                content: post.getElementsByTagName('content')[0].textContent,
                url: post.getElementsByTagName('url')[0].textContent
            }));

            // Parse Authors
            const authorItems = authorsJson.map(author => ({
                type: 'author',
                title: author.name,
                content: author.intro || "",
                url: author.path,
                avatar: author.avatar
            }));

            searchData = [...authorItems, ...postItems];
        })
        .catch(err => console.error("Error loading search data:", err));

    // Handle input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchResults.innerHTML = '';

        if (query.length < 2) return;

        const filtered = searchData.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            searchResults.innerHTML = '<p style="text-align:center; color:#666; padding: 20px;">No results found.</p>';
            return;
        }

        filtered.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.style.cssText = 'padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 15px;';

            let iconHtml = '';
            if (item.type === 'author') {
                iconHtml = item.avatar ? `<img src="${item.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : '<div style="width:40px; height:40px; border-radius:50%; background:#ddd;"></div>';
            }

            resultItem.innerHTML = `
                ${iconHtml}
                <div>
                    <h3 style="margin:0; font-size:1.2rem;">${item.title} ${item.type === 'author' ? '<small style="font-size:0.8rem; color:#888; margin-left:5px;">(Auteur)</small>' : ''}</h3>
                    ${item.type === 'author' ? `<p style="margin:5px 0 0; font-size:0.9rem; color:#666;">${item.content.substring(0, 60)}...</p>` : ''}
                </div>
            `;

            resultItem.addEventListener('click', () => {
                window.location.href = item.url;
            });

            // Hover effect
            resultItem.onmouseover = () => resultItem.style.background = '#f9f9f9';
            resultItem.onmouseout = () => resultItem.style.background = 'transparent';

            searchResults.appendChild(resultItem);
        });
    });
});
