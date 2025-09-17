package com.shopsphere.service;

import com.shopsphere.dto.CartItemDto;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<CartItemDto> getCartItems(User user) {
        return cartItemRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public CartItemDto addToCart(User user, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
        }
        
        Optional<CartItem> existingCartItem = cartItemRepository.findByUserAndProduct(user, product);
        
        if (existingCartItem.isPresent()) {
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            CartItem savedCartItem = cartItemRepository.save(cartItem);
            return convertToDto(savedCartItem);
        } else {
            CartItem newCartItem = new CartItem(user, product, quantity);
            CartItem savedCartItem = cartItemRepository.save(newCartItem);
            return convertToDto(savedCartItem);
        }
    }
    
    public CartItemDto updateCartItem(User user, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
        }
        
        cartItem.setQuantity(quantity);
        CartItem savedCartItem = cartItemRepository.save(cartItem);
        return convertToDto(savedCartItem);
    }
    
    public void removeFromCart(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        cartItemRepository.deleteByUserAndProduct(user, product);
    }
    
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }
    
    private CartItemDto convertToDto(CartItem cartItem) {
        return new CartItemDto(
            cartItem.getId(),
            cartItem.getProduct().getId(),
            cartItem.getProduct().getName(),
            cartItem.getProduct().getImageUrl(),
            cartItem.getProduct().getPrice(),
            cartItem.getQuantity(),
            cartItem.getTotalPrice()
        );
    }
}
