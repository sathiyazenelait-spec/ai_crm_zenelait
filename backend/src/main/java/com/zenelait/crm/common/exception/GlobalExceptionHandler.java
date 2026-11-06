package com.zenelait.crm.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> errBody = new LinkedHashMap<>();
        errBody.put("code", ex.getCode());
        errBody.put("message", ex.getMessage());

        if (ex instanceof ValidationException ve && !ve.getDetails().isEmpty()) {
            errBody.put("details", ve.getDetails());
        }

        errBody.put("requestId", reqId);

        return ResponseEntity.status(ex.getStatus()).body(Map.of("error", errBody));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        List<Map<String, String>> details = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = (error instanceof FieldError fe) ? fe.getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            details.add(Map.of("field", fieldName, "message", errorMessage != null ? errorMessage : "Invalid value"));
        });

        Map<String, Object> errBody = new LinkedHashMap<>();
        errBody.put("code", "VALIDATION_ERROR");
        errBody.put("message", "The requested operation is invalid.");
        errBody.put("details", details);
        errBody.put("requestId", reqId);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errBody));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthException(AuthenticationException ex) {
        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> errBody = new LinkedHashMap<>();
        errBody.put("code", "UNAUTHORIZED");
        errBody.put("message", ex.getMessage() != null ? ex.getMessage() : "Missing or invalid authentication.");
        errBody.put("requestId", reqId);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", errBody));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> errBody = new LinkedHashMap<>();
        errBody.put("code", "FORBIDDEN");
        errBody.put("message", "Authenticated user lacks permission.");
        errBody.put("requestId", reqId);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", errBody));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> errBody = new LinkedHashMap<>();
        errBody.put("code", "VALIDATION_ERROR");
        errBody.put("message", ex.getMessage());
        errBody.put("requestId", reqId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errBody));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> errBody = new LinkedHashMap<>();
        errBody.put("code", "INTERNAL_SERVER_ERROR");
        errBody.put("message", ex.getMessage() != null ? ex.getMessage() : "Unexpected server error.");
        errBody.put("requestId", reqId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", errBody));
    }
}
