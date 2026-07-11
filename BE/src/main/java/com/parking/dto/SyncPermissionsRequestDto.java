package com.parking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncPermissionsRequestDto {

    @Valid
    @NotEmpty(message = "Role permissions list must not be empty")
    private List<RolePermissionEntry> roles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RolePermissionEntry {
        @NotNull(message = "Role ID is required")
        private Long roleId;

        @NotNull(message = "Permission IDs list is required")
        private List<Long> permissionIds;
    }
}
