package com.dahd.farmportal.dto.response;

import com.dahd.farmportal.model.User;
import lombok.*;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private String userId;
    private String username;
    private String fullName;
    private String email;
    private Set<User.Role> roles;
}
