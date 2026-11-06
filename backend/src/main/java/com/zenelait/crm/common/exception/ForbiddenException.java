package com.zenelait.crm.common.exception;

public class ForbiddenException extends ApiException {
    public ForbiddenException(String message) {
        super("FORBIDDEN", message, 403);
    }
}
