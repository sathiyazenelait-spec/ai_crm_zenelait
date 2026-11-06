package com.zenelait.crm.common.exception;

public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super("UNAUTHORIZED", message, 401);
    }
}
