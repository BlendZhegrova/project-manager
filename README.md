# Project Manager

## Overview
Project Manager is a tool designed to help you organize, track, and manage your projects efficiently.

## Features
- Task creation and assignment
- Progress tracking

## How to Run
1. Ensure you have Node.js and npm installed on your system.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the application using:
    ```bash
    npm start
    ```

## Database Setup
1. Set up a PostgreSQL database.
2. Create a `.env` file in the root directory and add the following:
    ```
    DB_HOST=your-database-host
    DB_PORT=your-database-port
    DB_USER=your-database-username
    DB_PASSWORD=your-database-password
    DB_NAME=your-database-name
    ```
3. Run database migrations:
    ```bash
    npm run migrate
    ```

## Stack Used
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Others**: PRISMA ORM, dotenv for environment variables
- **Collaboration tools**: Git, GitHub

