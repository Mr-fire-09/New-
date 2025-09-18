package com.shopsphere.controller;

import com.shopsphere.dto.CartItemDto;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCartItems(Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<CartItemDto> cartItems = cartService.getCartItems(user);
        return ResponseEntity.ok(cartItems);
    }
    
    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addToCart(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        
        CartItemDto cartItem = cartService.addToCart(user, productId, quantity);
        return ResponseEntity.ok(cartItem);
    }
    
    @PutMapping("/update")
    public ResponseEntity<CartItemDto> updateCartItem(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        
        CartItemDto cartItem = cartService.updateCartItem(user, productId, quantity);
        return ResponseEntity.ok(cartItem);
    }
    
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartService.removeFromCart(user, productId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }
    
    private User getCurrentUser(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
