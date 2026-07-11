# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw -B clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y mysql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
COPY --from=build /app/wait-for-mysql.sh /app/wait-for-mysql.sh
RUN chmod +x /app/wait-for-mysql.sh
EXPOSE 8080
ENTRYPOINT ["/bin/bash", "-c", "/app/wait-for-mysql.sh mysql 3306 parking parkingpassword && java -jar app.jar"]