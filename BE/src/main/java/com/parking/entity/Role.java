package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    //Khóa chính và tự tăng dần
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Name không được trùng, không được rỗng và không dài hơn 50 ký tự
    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
