package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String fullName;
    private String mobileNumber;
    private String aadhaarNumber;

    private Set<Role> roles;

    private String stateCode;
    private String districtCode;
    private String blockCode;

    private boolean active;
    private boolean emailVerified;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Role {
        ROLE_FARMER,
        ROLE_VET_OFFICER,
        ROLE_DISTRICT_OFFICER,
        ROLE_STATE_OFFICER,
        ROLE_ADMIN,
        ROLE_SUPER_ADMIN
    }
}
