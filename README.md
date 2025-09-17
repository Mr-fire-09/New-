# ShopSphere - Full-Stack E-commerce Application

A complete e-commerce web application built with Spring Boot backend, HTML/CSS/JavaScript frontend, and MySQL database.

## Features

- **Product Catalog**: Browse all products with images, descriptions, and prices
- **Shopping Cart**: Add/remove items, view cart contents
- **Checkout System**: Place orders with confirmation
- **User Authentication**: Login/signup functionality
- **Order History**: Track past orders
- **Admin Panel**: Manage products and orders
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Spring Boot, Spring Security, Spring Data JPA
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: MySQL
- **Build Tool**: Maven

## Project Structure

```
ShopSphere/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/               # HTML/CSS/JavaScript frontend
│   ├── css/
│   ├── js/
│   └── pages/
├── database/               # Database scripts
└── README.md
```

## Quick Start

1. **Database Setup**:
   - Install MySQL
   - Create database: `CREATE DATABASE shopsphere;`
   - Run the SQL scripts in `database/` folder

2. **Backend Setup**:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

3. **Frontend Setup**:
   - Open `frontend/index.html` in your browser
   - Or serve using a local web server

## Default Credentials

- **Admin**: admin@shopsphere.com / admin123
- **User**: user@shopsphere.com / user123

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/orders` - Create new order

## License

MIT License - see LICENSE file for details