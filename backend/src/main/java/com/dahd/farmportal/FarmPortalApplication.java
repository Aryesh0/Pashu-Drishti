package com.dahd.farmportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class FarmPortalApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmPortalApplication.class, args);
    }
}
