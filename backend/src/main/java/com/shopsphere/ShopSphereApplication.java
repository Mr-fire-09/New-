package com.shopsphere;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.shopsphere.entity.Product;
import com.shopsphere.repository.ProductRepository;

@SpringBootApplication
public class ShopSphereApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopSphereApplication.class, args);
    }

    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                Product p1 = new Product("Wireless Headphones", "High-quality wireless headphones with noise cancellation", new BigDecimal("99.99"), 50);
                p1.setCategory("Electronics");
                p1.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600");
                productRepository.save(p1);

                Product p2 = new Product("Smartphone", "Latest smartphone with advanced features", new BigDecimal("699.99"), 25);
                p2.setCategory("Electronics");
                p2.setImageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600");
                productRepository.save(p2);
            }
        };
    }
}
