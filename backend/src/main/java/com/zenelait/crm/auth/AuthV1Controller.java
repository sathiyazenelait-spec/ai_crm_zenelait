package com.zenelait.crm.auth;

import com.zenelait.crm.auth.dto.LoginRequest;
import com.zenelait.crm.auth.dto.LoginResponse;
import com.zenelait.crm.auth.dto.RefreshTokenRequest;
import com.zenelait.crm.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthV1Controller {

    private final AuthService authService;

    public AuthV1Controller(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/v1/auth/login
     * Standard CRM Login returning accessToken, refreshToken, tokenType, expiresIn, user
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginV1(request));
    }

    /**
     * POST /api/v1/auth/refresh
     * Refresh access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshTokenRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(authService.refreshV1(request, email));
    }
}
