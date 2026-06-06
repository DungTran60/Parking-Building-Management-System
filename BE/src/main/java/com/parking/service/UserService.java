package com.parking.service;

import com.parking.dto.UserCreateDto;
import com.parking.dto.UserResponseDto;
import com.parking.dto.UserUpdateDto;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {
    UserResponseDto createUser(UserCreateDto dto);
    UserResponseDto getUserById(Long id);
    UserResponseDto getUserByUsername(String username);
    List<UserResponseDto> getAllUsers();
    UserResponseDto updateUser(Long id, UserUpdateDto dto);
    void deleteUser(Long id);
}
