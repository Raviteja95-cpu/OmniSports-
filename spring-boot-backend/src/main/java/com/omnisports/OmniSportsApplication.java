package com.omnisports;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OmniSportsApplication {

    public static void main(String[] args) {
        SpringApplication.run(OmniSportsApplication.class, args);
        System.out.println("✦ OmniSports Platform Engine Booted Successfully ✦");
    }
}
