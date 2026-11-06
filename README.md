# ai_crm_zenelait

# Zenelait AI Multi-Tenant SaaS CRM

An intelligent, multi-tenant enterprise CRM platform powered by autonomous AI employees, Spring Boot backend, and React Vite frontend connected to TiDB Cloud Serverless MySQL.

## Key Features
- **Multi-Tenant Architecture**: 9 vertical industries (Software/IT, Real Estate, E-commerce, Hospitality, Healthcare, Travel, Education, Manufacturing, Financial Services).
- **Autonomous AI Employees**: Automated qualification SDRs, concierge agents, multi-channel inbound handling, dynamic follow-ups, and auto-scheduling.
- **Backend**: Spring Boot 3.2.3 with Spring Security, BCrypt authentication, JWT tokens, JPA/Hibernate, HikariCP.
- **Database**: TiDB Cloud Serverless (MySQL 8.0 protocol compatible) with TLS encryption.
- **Frontend**: React 18, Vite, Lucide Icons, Tailwind CSS, high-contrast accessible UI.

## Getting Started

### Backend
```bash
cd backend
./mvnw clean spring-boot:run
```

### Frontend
```bash
npm install
npm run dev
```

### Docker Deployment
```bash
cd backend
docker build -t zenelait-crm-backend .
docker run -p 8080:8080 zenelait-crm-backend
```
