// Admin Panel Management
class AdminPanel {
    constructor() {
        this.products = [];
        this.orders = [];
        this.currentTab = 'products';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
    }

    setupEventListeners() {
        // Product form handler
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');

        this.currentTab = tabName;

        // Load data for the selected tab
        if (tabName === 'products') {
            this.loadProducts();
        } else if (tabName === 'orders') {
            this.loadOrders();
        }
    }

    async loadProducts() {
        const loading = document.getElementById('loading');
        const tableBody = document.getElementById('productsTableBody');

        if (loading) loading.style.display = 'block';

        try {
            this.products = await apiClient.getProducts();
            this.renderProductsTable();
        } catch (error) {
            console.error('Failed to load products:', error);
            showNotification('Failed to load products', 'error');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    async loadOrders() {
        const loading = document.getElementById('loading');
        const tableBody = document.getElementById('ordersTableBody');

        if (loading) loading.style.display = 'block';

        try {
            this.orders = await apiClient.getAllOrders();
            this.renderOrdersTable();
        } catch (error) {
            console.error('Failed to load orders:', error);
            showNotification('Failed to load orders', 'error');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    renderProductsTable() {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.category || 'Uncategorized'}</td>
                <td>
                    <button class="btn btn-outline" onclick="adminPanel.editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="adminPanel.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderOrdersTable() {
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.userName}</td>
                <td>$${parseFloat(order.totalAmount).toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${order.status.toLowerCase()}">
                        ${order.status}
                    </span>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline" onclick="adminPanel.viewOrder(${order.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <select onchange="adminPanel.updateOrderStatus(${order.id}, this.value)">
                        <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                        <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                        <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                        <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }

    showAddProductModal() {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (title) title.textContent = 'Add Product';
        if (form) form.reset();
        document.getElementById('productId').value = '';

        if (modal) modal.style.display = 'block';
    }

    async editProduct(productId) {
        try {
            const product = await apiClient.getProduct(productId);
            this.showEditProductModal(product);
        } catch (error) {
            console.error('Failed to load product:', error);
            showNotification('Failed to load product', 'error');
        }
    }

    showEditProductModal(product) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');

        if (title) title.textContent = 'Edit Product';

        // Populate form with product data
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productImageUrl').value = product.imageUrl || '';

        if (modal) modal.style.display = 'block';
    }

    async saveProduct() {
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value,
            imageUrl: document.getElementById('productImageUrl').value
        };

        try {
            if (productId) {
                await apiClient.updateProduct(productId, productData);
                showNotification('Product updated successfully!', 'success');
            } else {
                await apiClient.createProduct(productData);
                showNotification('Product created successfully!', 'success');
            }

            closeModal('productModal');
            this.loadProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            showNotification('Failed to save product', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await apiClient.deleteProduct(productId);
            showNotification('Product deleted successfully!', 'success');
            this.loadProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            showNotification('Failed to delete product', 'error');
        }
    }

    async viewOrder(orderId) {
        try {
            const order = await apiClient.getOrder(orderId);
            this.showOrderModal(order);
        } catch (error) {
            console.error('Failed to load order:', error);
            showNotification('Failed to load order', 'error');
        }
    }

    showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const orderDetail = document.getElementById('orderDetail');

        if (orderDetail) {
            orderDetail.innerHTML = `
                <div class="order-detail">
                    <h3>Order #${order.id}</h3>
                    <div class="order-info">
                        <p><strong>Customer:</strong> ${order.userName}</p>
                        <p><strong>Total:</strong> $${parseFloat(order.totalAmount).toFixed(2)}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Shipping Address:</strong></p>
                        <p style="white-space: pre-line; margin-left: 1rem;">${order.shippingAddress}</p>
                    </div>
                    <div class="order-items">
                        <h4>Order Items:</h4>
                        <table class="order-items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.orderItems.map(item => `
                                    <tr>
                                        <td>${item.productName}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${parseFloat(item.price).toFixed(2)}</td>
                                        <td>$${parseFloat(item.totalPrice).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        if (modal) modal.style.display = 'block';
    }

    async updateOrderStatus(orderId, status) {
        try {
            await apiClient.updateOrderStatus(orderId, status);
            showNotification('Order status updated successfully!', 'success');
            this.loadOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            showNotification('Failed to update order status', 'error');
        }
    }
}

// Create global admin panel instance
const adminPanel = new AdminPanel();

// Global functions for HTML onclick handlers
function showTab(tabName) {
    adminPanel.showTab(tabName);
}

function showAddProductModal() {
    adminPanel.showAddProductModal();
}

// Add CSS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }
    .status-pending { background-color: #ffc107; color: #000; }
    .status-confirmed { background-color: #17a2b8; color: #fff; }
    .status-shipped { background-color: #007bff; color: #fff; }
    .status-delivered { background-color: #28a745; color: #fff; }
    .status-cancelled { background-color: #dc3545; color: #fff; }
    
    .order-items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    .order-items-table th,
    .order-items-table td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
    .order-items-table th {
        background-color: #f8f9fa;
    }
`;
document.head.appendChild(style);
