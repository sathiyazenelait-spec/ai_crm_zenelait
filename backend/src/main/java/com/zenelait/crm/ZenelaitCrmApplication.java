package com.zenelait.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ZenelaitCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZenelaitCrmApplication.class, args);
        System.out.println("=========================================================");
        System.out.println("🚀 ZENELAIT AI MULTI-TENANT SAAS CRM BACKEND RUNNING ON 8080");
        System.out.println("🔐 Spring Security with BCrypt & JWT Authenticator Active");
        System.out.println("=========================================================");
    }
}
