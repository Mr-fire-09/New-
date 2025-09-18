// Main application logic
class App {
    constructor() {
        this.products = [];
        this.currentCategory = '';
        this.searchKeyword = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts();
                }
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterByCategory();
            });
        }
    }

    async loadProducts() {
        const loading = document.getElementById('loading');
        const productsGrid = document.getElementById('productsGrid');
        const featuredProducts = document.getElementById('featuredProducts');

        if (loading) loading.style.display = 'block';

        try {
            this.products = await apiClient.getProducts();
            
            if (productsGrid) {
                this.renderProducts(this.products, productsGrid);
            }
            
            if (featuredProducts) {
                // Show only first 6 products on homepage
                const featured = this.products.slice(0, 6);
                this.renderProducts(featured, featuredProducts);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            showNotification('Failed to load products', 'error');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    async searchProducts() {
        const searchInput = document.getElementById('searchInput');
        const keyword = searchInput ? searchInput.value.trim() : '';
        
        if (!keyword) {
            this.loadProducts();
            return;
        }

        this.searchKeyword = keyword;
        const loading = document.getElementById('loading');
        const productsGrid = document.getElementById('productsGrid');

        if (loading) loading.style.display = 'block';

        try {
            this.products = await apiClient.searchProducts(keyword);
            this.renderProducts(this.products, productsGrid);
        } catch (error) {
            console.error('Search failed:', error);
            showNotification('Search failed', 'error');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    async filterByCategory() {
        const categoryFilter = document.getElementById('categoryFilter');
        const category = categoryFilter ? categoryFilter.value : '';
        
        this.currentCategory = category;
        const loading = document.getElementById('loading');
        const productsGrid = document.getElementById('productsGrid');

        if (loading) loading.style.display = 'block';

        try {
            if (category) {
                this.products = await apiClient.getProductsByCategory(category);
            } else {
                this.products = await apiClient.getProducts();
            }
            this.renderProducts(this.products, productsGrid);
        } catch (error) {
            console.error('Filter failed:', error);
            showNotification('Filter failed', 'error');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    renderProducts(products, container) {
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'No description available'}</p>
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="app.addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-view" onclick="app.viewProduct(${product.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async addToCart(productId) {
        const success = await cartManager.addToCart(productId, 1);
        if (success) {
            // Update cart count immediately
            cartManager.updateCartCount();
        }
    }

    async viewProduct(productId) {
        try {
            const product = await apiClient.getProduct(productId);
            this.showProductModal(product);
        } catch (error) {
            console.error('Failed to load product details:', error);
            showNotification('Failed to load product details', 'error');
        }
    }

    showProductModal(product) {
        const modal = document.getElementById('productModal');
        const productDetail = document.getElementById('productDetail');
        
        if (productDetail) {
            productDetail.innerHTML = `
                <div class="product-detail-content">
                    <div class="product-detail-image">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                             alt="${product.name}" style="width: 100%; max-width: 400px; height: auto;">
                    </div>
                    <div class="product-detail-info">
                        <h2>${product.name}</h2>
                        <p class="product-detail-description">${product.description || 'No description available'}</p>
                        <div class="product-detail-price">$${parseFloat(product.price).toFixed(2)}</div>
                        <div class="product-detail-stock">
                            <span class="stock-label">Stock:</span>
                            <span class="stock-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                            </span>
                        </div>
                        <div class="product-detail-category">
                            <span class="category-label">Category:</span>
                            <span class="category-value">${product.category || 'Uncategorized'}</span>
                        </div>
                        <div class="product-detail-actions">
                            <button class="btn btn-primary btn-large" 
                                    onclick="app.addToCart(${product.id}); closeModal('productModal');"
                                    ${product.stock <= 0 ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (modal) modal.style.display = 'block';
    }
}

// Create global app instance
const app = new App();

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Cart will be initialized by cartManager
    cartManager.init();
    
    // Load cart items if user is logged in
    if (authManager.isLoggedIn()) {
        cartManager.loadCartItems();
    }
});
