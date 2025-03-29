 // API Configuration (Replace with your actual API key)
 const API_KEY = '67560cb6f527405eb676327d3c115ee5';
 const BASE_URL = 'https://newsapi.org/v2/top-headlines';

 // DOM Elements
 const newsGrid = document.getElementById('newsGrid');
 const searchInput = document.getElementById('searchInput');
 const categorySelect = document.getElementById('categorySelect');
 const darkModeToggle = document.getElementById('darkModeToggle');
 const loadingSpinner = document.getElementById('loadingSpinner');
 const resultCount = document.getElementById('resultCount');

 // Check for saved theme preference
 if (localStorage.getItem('darkMode') === 'enabled') {
     document.body.classList.add('dark-mode');
     darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
 }

 // Dark Mode Toggle
 darkModeToggle.addEventListener('click', () => {
     document.body.classList.toggle('dark-mode');
     
     if (document.body.classList.contains('dark-mode')) {
         localStorage.setItem('darkMode', 'enabled');
         darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
     } else {
         localStorage.setItem('darkMode', 'disabled');
         darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
     }
 });

 // Format Date
 function formatDate(dateString) {
     const options = { year: 'numeric', month: 'short', day: 'numeric' };
     return new Date(dateString).toLocaleDateString('en-US', options);
 }

 // Determine Category Color
 function getCategoryColor(category) {
     const colors = {
         'technology': '#3b82f6',
         'sports': '#10b981',
         'business': '#8b5cf6',
         'entertainment': '#ec4899',
         'health': '#ef4444',
         'science': '#f59e0b',
         'general': '#6b7280'
     };
     
     return colors[category] || colors.general;
 }

 // Fetch News Function
 async function fetchNews(query = '', category = '') {
     // Show loading spinner
     loadingSpinner.style.display = 'flex';
     newsGrid.innerHTML = '';

     try {
         // Build URL parameters
         const params = new URLSearchParams({
             apiKey: API_KEY,
             pageSize: 10,
         });
         
         // Add country parameter if no search query
         if (!query) {
             params.append('country', 'us');
         }
         
         // Add query if provided
         if (query) {
             params.append('q', query);
         }
         
         // Add category if provided
         if (category) {
             params.append('category', category);
         }

         const response = await fetch(`${BASE_URL}?${params}`);
         const data = await response.json();

         // Hide loading spinner
         loadingSpinner.style.display = 'none';

         // Update result count
         if (data.articles && data.articles.length > 0) {
             resultCount.textContent = `Showing ${data.articles.length} ${
                 query ? `results for "${query}"` : 'top stories'
             } ${category ? `in ${category}` : ''}`;
             
             // Render News Cards
             data.articles.forEach(article => {
                 const card = createNewsCard(article, category);
                 newsGrid.appendChild(card);
             });
         } else {
             resultCount.textContent = 'No results found';
             newsGrid.innerHTML = `
                 <div class="no-results">
                     <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                     <h2>No results found</h2>
                     <p>Try adjusting your search or category to find what you're looking for.</p>
                 </div>
             `;
         }
     } catch (error) {
         console.error('Error fetching news:', error);
         loadingSpinner.style.display = 'none';
         newsGrid.innerHTML = `
             <div class="no-results">
                 <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                 <h2>Error loading news</h2>
                 <p>Please check your connection and try again.</p>
             </div>
         `;
     }
 }

 // Create News Card Function
 function createNewsCard(article, defaultCategory) {
     const card = document.createElement('div');
     card.classList.add('news-card');

     // Determine category
     const category = article.category || defaultCategory || 'general';
     
     // Format date
     const date = article.publishedAt ? formatDate(article.publishedAt) : 'Recent';
     
     // Get source name
     const source = article.source?.name || 'News Source';

     card.innerHTML = `
         <div class="news-image-container">
             <img src="${article.urlToImage || '/api/placeholder/300/200'}" alt="${article.title || 'News image'}">
             <span class="news-category" style="background-color: ${getCategoryColor(category)}">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
         </div>
         <div class="news-card-content">
             <span class="news-source">${source}</span>
             <span class="news-date"><i class="far fa-clock"></i> ${date}</span>
             <h3 class="news-card-title">${article.title || 'News headline unavailable'}</h3>
             <p class="news-card-description">${article.description || 'No description available for this news article.'}</p>
             <div class="card-actions">
                 <a href="${article.url}" target="_blank" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
                 <button class="share-btn" onclick="shareArticle('${article.url}')">
                     <i class="fas fa-share-alt"></i>
                 </button>
             </div>
         </div>
     `;

     return card;
 }

 // Share Article Function
 window.shareArticle = function(url) {
     if (navigator.share) {
         navigator.share({
             title: 'Check out this news article',
             url: url
         })
         .catch(err => console.error('Error sharing:', err));
     } else {
         // Fallback - copy to clipboard
         navigator.clipboard.writeText(url)
             .then(() => alert('Link copied to clipboard!'))
             .catch(err => console.error('Error copying link:', err));
     }
 };

 // Debounce function for search
 function debounce(func, wait) {
     let timeout;
     return function(...args) {
         clearTimeout(timeout);
         timeout = setTimeout(() => func.apply(this, args), wait);
     };
 }

 // Event Listeners
 const debouncedSearch = debounce(() => {
     const query = searchInput.value;
     const category = categorySelect.value;
     fetchNews(query, category);
 }, 500);

 searchInput.addEventListener('input', debouncedSearch);

 categorySelect.addEventListener('change', () => {
     const query = searchInput.value;
     const category = categorySelect.value;
     fetchNews(query, category);
 });

 // Initial News Load
 document.addEventListener('DOMContentLoaded', () => {
     fetchNews();
 });