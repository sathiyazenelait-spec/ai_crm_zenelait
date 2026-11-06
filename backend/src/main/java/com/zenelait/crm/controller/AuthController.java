package com.zenelait.crm.controller;

import com.zenelait.crm.dto.AuthRequest;
import com.zenelait.crm.dto.AuthResponse;
import com.zenelait.crm.dto.RegisterRequest;
import com.zenelait.crm.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Authenticates user against MySQL with BCrypt hashed password & generates JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "Authentication Failed",
                    "message", ex.getMessage()
            ));
        }
    }

    /**
     * POST /api/auth/register
     * Registers a new user under a chosen company (with case/space-insensitive company search).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Registration Error",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Server Error",
                    "message", ex.getMessage()
            ));
        }
    }

    /**
     * GET /api/auth/status
     */
    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(Map.of(
                "status", "ONLINE",
                "security", "Spring Security 6.2 + BCrypt + JWT",
                "database", "MySQL 8.0"
        ));
    }
}
