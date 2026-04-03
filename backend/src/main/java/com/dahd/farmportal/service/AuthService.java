package com.dahd.farmportal.service;

import com.dahd.farmportal.dto.request.LoginRequest;
import com.dahd.farmportal.dto.request.RegisterRequest;
import com.dahd.farmportal.dto.response.AuthResponse;
import com.dahd.farmportal.exception.DuplicateResourceException;
import com.dahd.farmportal.exception.UnauthorizedException;
import com.dahd.farmportal.model.RefreshToken;
import com.dahd.farmportal.model.User;
import com.dahd.farmportal.repository.RefreshTokenRepository;
import com.dahd.farmportal.repository.UserRepository;
import com.dahd.farmportal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final AuditService auditService;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Set<User.Role> roles = (request.getRoles() == null || request.getRoles().isEmpty())
                ? Set.of(User.Role.ROLE_FARMER)
                : request.getRoles();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .mobileNumber(request.getMobileNumber())
                .aadhaarNumber(request.getAadhaarNumber())
                .roles(roles)
                .stateCode(request.getStateCode())
                .districtCode(request.getDistrictCode())
                .blockCode(request.getBlockCode())
                .active(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getUsername());

        auditService.log(user.getId(), user.getUsername(), "REGISTER", "User", user.getId(),
                "New user registered", null, true, null);

        return generateAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request, String ipAddress) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User does not exist"));

        if (!Boolean.TRUE.equals(user.isActive())) {
            throw new UnauthorizedException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Password is incorrect");
        }

        auditService.log(user.getId(), user.getUsername(), "LOGIN", "User", user.getId(),
                "User logged in from: " + ipAddress, ipAddress, true, null);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return generateAuthResponse(user);
    }

    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("User {} logged out", userId);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtUtils.generateToken(userDetails);
        String refreshToken = createRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }

    private String createRefreshToken(String userId) {
        refreshTokenRepository.deleteByUserId(userId);

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();

        return refreshTokenRepository.save(refreshToken).getToken();
    }
}
