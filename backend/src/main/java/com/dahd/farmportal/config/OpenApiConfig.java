package com.dahd.farmportal.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI farmPortalOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("VASUDHA Digital Farm Management Portal API")
                        .description("REST API for the Digital Farm Management Portal — " +
                                "DAHD India's integrated livestock and farm management system. " +
                                "Covers farm registration, animal records, MRL testing, " +
                                "antimicrobial usage tracking, and admin dashboards.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("DAHD India - IT Division")
                                .email("support@dahd.gov.in")
                                .url("https://dahd.nic.in"))
                        .license(new License()
                                .name("Government of India")
                                .url("https://india.gov.in")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token obtained from /auth/login")));
    }
}
