# ===================================================================
# Multi-stage Dockerfile for Zenelait AI CRM Spring Boot Backend
# Optimized for Cloud Deployment (Render, Railway, AWS App Runner, Fly.io, etc.)
# ===================================================================

# Stage 1: Build the JAR with Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root application user for container security
RUN addgroup -S zenelait && adduser -S zenelait -G zenelait
USER zenelait

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Cloud container port
ENV PORT=8080
EXPOSE 8080

# Production JVM flags for low memory footprint and high responsiveness
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

