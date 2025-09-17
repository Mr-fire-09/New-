-- Create database
CREATE DATABASE IF NOT EXISTS shopsphere;
USE shopsphere;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Insert sample admin user
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@shopsphere.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- Insert sample regular user
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'user@shopsphere.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER');

-- Insert sample products
INSERT INTO products (name, description, price, stock, image_url, category) VALUES 
('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', 'Electronics'),
('Smartphone', 'Latest smartphone with advanced features', 699.99, 25, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', 'Electronics'),
('Running Shoes', 'Comfortable running shoes for all terrains', 129.99, 100, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', 'Sports'),
('Coffee Maker', 'Automatic coffee maker with programmable features', 89.99, 30, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300', 'Home & Kitchen'),
('Laptop', 'High-performance laptop for work and gaming', 1299.99, 15, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300', 'Electronics'),
('Yoga Mat', 'Non-slip yoga mat for home workouts', 39.99, 75, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300', 'Sports'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 49.99, 40, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'Home & Kitchen'),
('Bluetooth Speaker', 'Portable Bluetooth speaker with great sound quality', 79.99, 60, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300', 'Electronics'),
('Water Bottle', 'Insulated water bottle to keep drinks cold', 24.99, 120, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300', 'Sports'),
('Backpack', 'Durable backpack for travel and daily use', 59.99, 80, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', 'Accessories');
