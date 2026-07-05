package com.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Parking Building Management System Spring Boot application.
 * This class enables auto-configuration, component scanning, and scheduling for background tasks.
 */
@SpringBootApplication
@EnableScheduling
public class ParkingBuildingManagementSystemApplication {

	/**
	 * The main method which starts the Spring Boot application.
	 *
	 * @param args Command line arguments passed to the application.
	 */
	public static void main(String[] args) {
		SpringApplication.run(ParkingBuildingManagementSystemApplication.class, args);
	}

}
