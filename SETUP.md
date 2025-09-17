# ShopSphere Setup Guide

This guide will help you set up and run the ShopSphere e-commerce application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher
- **Maven 3.6** or higher
- **MySQL 8.0** or higher
- **Node.js** (optional, for serving frontend files)

## Database Setup

1. **Install MySQL** and start the MySQL service.

2. **Create the database**:
   ```sql
   CREATE DATABASE shopsphere;
   ```

3. **Run the initialization script**:
   ```bash
   mysql -u root -p shopsphere < database/init.sql
   ```

4. **Update database credentials** in `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/shopsphere?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
       username: your_username
       password: your_password
   ```

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

## Frontend Setup

### Option 1: Simple File Server

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Serve the files** using any HTTP server:
   
   **Using Python**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Using Node.js** (if you have it installed):
   ```bash
   npx http-server -p 8000
   ```

3. **Open your browser** and go to `http://localhost:8000`

### Option 2: Using a Web Server

You can also serve the frontend files using Apache, Nginx, or any other web server.

## Default Credentials

The application comes with pre-configured test accounts:

### Admin Account
- **Email**: admin@shopsphere.com
- **Password**: admin123
- **Role**: Administrator

### User Account
- **Email**: user@shopsphere.com
- **Password**: user123
- **Role**: Regular User

## API Endpoints

The backend provides the following REST API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?keyword={keyword}` - Search products
- `GET /api/products/category/{category}` - Get products by category
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/{productId}` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/{id}/status` - Update order status (Admin only)

## Features

### Customer Features
- Browse product catalog with search and filtering
- Add/remove items from shopping cart
- User authentication (login/register)
- Place orders with shipping address
- View order history
- Responsive design for mobile and desktop

### Admin Features
- Manage products (add, edit, delete)
- View and manage orders
- Update order status
- Access admin panel at `/admin.html`

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure MySQL is running
   - Check database credentials in `application.yml`
   - Verify database exists and is accessible

2. **Port Already in Use**:
   - Change the port in `application.yml`:
     ```yaml
     server:
       port: 8081  # Change to different port
     ```

3. **CORS Issues**:
   - The backend is configured to allow CORS from any origin
   - If you encounter CORS issues, check the `WebSecurityConfig.java` file

4. **Frontend Not Loading**:
   - Ensure you're serving the frontend files through an HTTP server
   - Check browser console for any JavaScript errors
   - Verify the API base URL in `frontend/js/api.js`

### Logs

- Backend logs are available in the console where you run `mvn spring-boot:run`
- Check for any error messages or stack traces

## Development

### Adding New Features

1. **Backend**: Add new controllers, services, and entities as needed
2. **Frontend**: Update JavaScript files and HTML templates
3. **Database**: Add new tables or modify existing ones

### Code Structure

```
ShopSphere/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/shopsphere/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── entity/         # JPA entities
│   │   ├── dto/           # Data transfer objects
│   │   ├── security/      # Security configuration
│   │   └── config/        # Configuration classes
│   └── src/main/resources/
│       └── application.yml # Application configuration
├── frontend/               # HTML/CSS/JavaScript frontend
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── *.html             # HTML pages
└── database/              # Database scripts
    └── init.sql           # Database initialization
```

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify database connectivity and configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
