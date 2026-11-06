package com.zenelait.crm.common.exception;

import java.util.List;
import java.util.Map;

public class ValidationException extends ApiException {
    private final List<Map<String, String>> details;

    public ValidationException(String message) {
        super("VALIDATION_ERROR", message, 400);
        this.details = List.of();
    }

    public ValidationException(String message, List<Map<String, String>> details) {
        super("VALIDATION_ERROR", message, 400);
        this.details = details;
    }

    public List<Map<String, String>> getDetails() {
        return details;
    }
}
