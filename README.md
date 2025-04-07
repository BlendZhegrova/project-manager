# Project Manager

## Overview
Project Manager is a tool designed to help you organize, track, and manage your projects efficiently.

## Features
- Task creation and assignment
- Progress tracking
- Team collaboration tools
- Deadline reminders

## How to Run
1. Ensure you have Node.js and npm installed on your system.
2. Install dependencies:
    ```
    npm install --legacy-peer-deps
    ```
3. Start the application using:
    ```
    npm run dev
    ```

## Database Setup
1. **Configure the Database**: Ensure you have a PostgreSQL database set up and running.
2. **Environment Variables**: Create a `.env` file in the root directory and include the following details:
        ```env
        DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
        ```
        Replace `<username>`, `<password>`, `<host>`, `<port>`, and `<database>` with your database credentials.
        ```env
        JWT_SECRET : "Your Secret Key"
        ```
        Also add an jwt secret to your .env file.
3. **Run Migrations**: Apply the database schema using Prisma migrations:
        ```bash
        npx prisma migrate dev
         ```
4. **Seed the db**:  
        ```
        npx prisma db seed
        ```
5. **Verify Connection**: Test the database connection by running the application:
        ```bash
        npm run dev
        ```

## Stack Used
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Others**: Prisma ORM, dotenv for environment variables
- **Collaboration tools**: Git, GitHub

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
