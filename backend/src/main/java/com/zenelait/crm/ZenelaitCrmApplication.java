package com.zenelait.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class ZenelaitCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZenelaitCrmApplication.class, args);
        System.out.println("=========================================================");
        System.out.println("🚀 ZENELAIT AI MULTI-TENANT SAAS CRM BACKEND RUNNING ON 8080");
        System.out.println("🔐 Spring Security with BCrypt & JWT Authenticator Active");
        System.out.println("=========================================================");
    }
}
