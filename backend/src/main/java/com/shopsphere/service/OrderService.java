package com.shopsphere.service;

import com.shopsphere.dto.OrderDto;
import com.shopsphere.dto.OrderItemDto;
import com.shopsphere.entity.*;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public OrderDto createOrder(User user, String shippingAddress) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Calculate total amount
        BigDecimal totalAmount = cartItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Create order
        Order order = new Order(user, totalAmount);
        order.setShippingAddress(shippingAddress);
        order.setStatus(Order.OrderStatus.PENDING);
        
        Order savedOrder = orderRepository.save(order);
        
        // Create order items and update stock
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            // Check stock availability
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem(
                savedOrder, 
                product, 
                cartItem.getQuantity(), 
                product.getPrice()
            );
            savedOrder.getOrderItems().add(orderItem);
            
            // Update product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }
        
        // Clear cart
        cartItemRepository.deleteByUser(user);
        
        return convertToDto(savedOrder);
    }
    
    public List<OrderDto> getUserOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return convertToDto(order);
    }
    
    public OrderDto updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        return convertToDto(savedOrder);
    }
    
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private OrderDto convertToDto(Order order) {
        List<OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return new OrderDto(
            order.getId(),
            order.getUser().getId(),
            order.getUser().getName(),
            orderItemDtos,
            order.getTotalAmount(),
            order.getStatus().name(),
            order.getShippingAddress(),
            order.getCreatedAt()
        );
    }
    
    private OrderItemDto convertToDto(OrderItem orderItem) {
        return new OrderItemDto(
            orderItem.getId(),
            orderItem.getProduct().getId(),
            orderItem.getProduct().getName(),
            orderItem.getProduct().getImageUrl(),
            orderItem.getQuantity(),
            orderItem.getPrice(),
            orderItem.getTotalPrice()
        );
    }
}
