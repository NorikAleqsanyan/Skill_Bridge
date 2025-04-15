# 📁 Project Structure

src/

├── auth/ # Authentication & Role-based access

├── user/ # User profile management

├── customer/ # Customer specific logic

├── freelancer/ # Freelancer specific logic

├── skills/ # Skills management

├── job/ # Job post & management

├── mail/ # Email notifications

├── common/ # Shared utilities and decorators

└── main.ts # App bootstrap


## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB
- Gmail Account with App Password

### Installation

```bash```
```$ npm install```

### Create .env file

```bash```
```$ cp .env.example .env```

- MONGODB_URI=mongodb://127.0.0.1:27017/skillbridge

- JWT_SECRET=mySuperSecretKey

- EMAIL_USER=your_email@gmail.com

- EMAIL_PASS=your_app_password

### Run the project

```bash```
```$ npm run start:dev```

### 📬 Features

- 🔐 JWT-based Authentication
- 👤 Role-based access (Admin / Customer / Freelancer)
- 📄 Full Job Lifecycle (Post → Apply → Assign → Feedback)
- 💼 Freelancer Profiles + Skill Tags
- 📧 Email notifications via Gmail SMTP
- 🧠 MongoDB schema-based structure
- 💡 Modular architecture (NestJS Best Practices)


### 🛠️ Built With

- NestJS – Node.js framework
- MongoDB – NoSQL database
- Mongoose – ODM for MongoDB
- JWT + Passport – Authentication
- @nestjs-modules/mailer – Email Service
- TypeScript – Strict typing & scalability


### 📚 API Documentation (Recommended)

- Swagger setup coming soon…
- RESTful endpoints grouped per module

### 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.
