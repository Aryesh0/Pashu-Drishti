package com.dahd.farmportal.config;

import com.dahd.farmportal.model.User;
import com.dahd.farmportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
    }

    private void seedSuperAdmin() {
        if (userRepository.existsByUsername("superadmin")) {
            return;
        }

        User superAdmin = User.builder()
                .username("superadmin")
                .email("superadmin@dahd.gov.in")
                .password(passwordEncoder.encode("Admin@12345"))
                .fullName("Super Administrator")
                .mobileNumber("9000000000")
                .roles(Set.of(User.Role.ROLE_SUPER_ADMIN, User.Role.ROLE_ADMIN))
                .active(true)
                .emailVerified(true)
                .stateCode("ALL")
                .build();

        userRepository.save(superAdmin);
        log.info("✅ Super admin user seeded. Username: superadmin | Password: Admin@12345");

        // Seed a demo farmer
        if (!userRepository.existsByUsername("farmer_demo")) {
            User farmer = User.builder()
                    .username("farmer_demo")
                    .email("farmer@demo.in")
                    .password(passwordEncoder.encode("Farmer@123"))
                    .fullName("Demo Farmer")
                    .mobileNumber("9876543210")
                    .roles(Set.of(User.Role.ROLE_FARMER))
                    .active(true)
                    .emailVerified(true)
                    .stateCode("MH")
                    .districtCode("PUN")
                    .build();
            userRepository.save(farmer);
            log.info("✅ Demo farmer seeded. Username: farmer_demo | Password: Farmer@123");
        }
    }
}
