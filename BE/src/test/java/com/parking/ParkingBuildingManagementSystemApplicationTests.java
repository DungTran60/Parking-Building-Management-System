package com.parking;

import com.parking.repository.UserRepository;
import com.parking.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Dùng profile "dev" (H2 in-memory) để context test chạy được mà không cần MySQL thật.
@ActiveProfiles("dev")
@SpringBootTest
class ParkingBuildingManagementSystemApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Test
	void contextLoads() {
		System.out.println("=== ROLES IN DATABASE ===");
		roleRepository.findAll().forEach(role -> System.out.println("ID: " + role.getId() + ", Name: " + role.getName()));
		System.out.println("=== USERS IN DATABASE ===");
		userRepository.findAll().forEach(user -> System.out.println("ID: " + user.getId() + ", Username: " + user.getUsername() + ", Role: " + user.getRole().getName()));
	}

}
