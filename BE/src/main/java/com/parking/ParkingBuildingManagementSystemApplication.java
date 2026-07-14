package com.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParkingBuildingManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ParkingBuildingManagementSystemApplication.class, args);
	}

}
