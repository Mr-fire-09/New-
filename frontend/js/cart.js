// Cart Management
class CartManager {
    constructor() {
        this.cartItems = [];
        this.init();
    }

    init() {
        this.loadCartItems();
        this.updateCartCount();
    }

    async loadCartItems() {
        if (!authManager.isLoggedIn()) {
            this.cartItems = [];
            this.updateCartCount();
            return;
        }

        try {
            this.cartItems = await apiClient.getCartItems();
            this.updateCartCount();
            this.renderCartItems();
        } catch (error) {
            console.error('Failed to load cart items:', error);
            this.cartItems = [];
            this.updateCartCount();
        }
    }

    async addToCart(productId, quantity = 1) {
        if (!authManager.isLoggedIn()) {
            showNotification('Please login to add items to cart', 'warning');
            showLoginModal();
            return false;
        }

        try {
            await apiClient.addToCart(productId, quantity);
            await this.loadCartItems();
            showNotification('Item added to cart!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            showNotification('Failed to add item to cart', 'error');
            return false;
        }
    }

    async updateCartItem(productId, quantity) {
        if (!authManager.isLoggedIn()) {
            return false;
        }

        try {
            if (quantity <= 0) {
                await apiClient.removeFromCart(productId);
            } else {
                await apiClient.updateCartItem(productId, quantity);
            }
            await this.loadCartItems();
            return true;
        } catch (error) {
            console.error('Failed to update cart item:', error);
            showNotification('Failed to update cart item', 'error');
            return false;
        }
    }

    async removeFromCart(productId) {
        if (!authManager.isLoggedIn()) {
            return false;
        }

        try {
            await apiClient.removeFromCart(productId);
            await this.loadCartItems();
            showNotification('Item removed from cart', 'info');
            return true;
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            showNotification('Failed to remove item from cart', 'error');
            return false;
        }
    }

    async clearCart() {
        if (!authManager.isLoggedIn()) {
            return false;
        }

        try {
            await apiClient.clearCart();
            await this.loadCartItems();
            showNotification('Cart cleared', 'info');
            return true;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            showNotification('Failed to clear cart', 'error');
            return false;
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    renderCartItems() {
        const cartContent = document.getElementById('cartContent');
        const emptyCart = document.getElementById('emptyCart');
        const loading = document.getElementById('loading');

        if (loading) loading.style.display = 'none';

        if (!authManager.isLoggedIn()) {
            if (cartContent) cartContent.innerHTML = '<div class="text-center"><p>Please login to view your cart</p><button class="btn btn-primary" onclick="showLoginModal()">Login</button></div>';
            return;
        }

        if (this.cartItems.length === 0) {
            if (cartContent) cartContent.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartContent) {
            cartContent.style.display = 'block';
            cartContent.innerHTML = this.generateCartHTML();
        }
    }

    generateCartHTML() {
        const totalAmount = this.cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
        
        return `
            <div class="cart-items">
                ${this.cartItems.map(item => `
                    <div class="cart-item" data-product-id="${item.productId}">
                        <img src="${item.productImageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                             alt="${item.productName}" class="cart-item-image">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.productName}</div>
                            <div class="cart-item-price">$${parseFloat(item.productPrice).toFixed(2)}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" 
                                       min="1" onchange="cartManager.updateQuantity(${item.productId}, this.value)">
                                <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                            </div>
                            <button class="btn btn-danger" onclick="cartManager.removeFromCart(${item.productId})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span>$${totalAmount.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Shipping:</span>
                    <span>Free</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>$${totalAmount.toFixed(2)}</span>
                </div>
                <button class="btn btn-primary btn-large" onclick="showCheckoutModal()" style="width: 100%; margin-top: 1rem;">
                    Proceed to Checkout
                </button>
            </div>
        `;
    }

    async updateQuantity(productId, quantity) {
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity < 0) return;

        await this.updateCartItem(productId, numQuantity);
    }

    getCartTotal() {
        return this.cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    }

    getCartItemCount() {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// Create global cart manager instance
const cartManager = new CartManager();

// Checkout functions
function showCheckoutModal() {
    if (!authManager.isLoggedIn()) {
        showNotification('Please login to proceed with checkout', 'warning');
        showLoginModal();
        return;
    }

    const modal = document.getElementById('checkoutModal');
    const subtotal = document.getElementById('checkoutSubtotal');
    const total = document.getElementById('checkoutTotal');
    
    if (subtotal) subtotal.textContent = `$${cartManager.getCartTotal().toFixed(2)}`;
    if (total) total.textContent = `$${cartManager.getCartTotal().toFixed(2)}`;
    
    if (modal) modal.style.display = 'block';
}

// Checkout form handler
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!authManager.isLoggedIn()) {
                showNotification('Please login to place an order', 'warning');
                return;
            }

            const shippingAddress = document.getElementById('shippingAddress').value;
            if (!shippingAddress.trim()) {
                showNotification('Please enter a shipping address', 'warning');
                return;
            }

            try {
                const order = await apiClient.createOrder(shippingAddress);
                showNotification('Order placed successfully!', 'success');
                closeModal('checkoutModal');
                checkoutForm.reset();
                
                // Redirect to a success page or show order confirmation
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (error) {
                console.error('Failed to place order:', error);
                showNotification('Failed to place order. Please try again.', 'error');
            }
        });
    }
});
