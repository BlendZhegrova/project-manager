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
    ```bash
    npm install
    ```
3. Start the application using:
    ```bash
    npm start
    ```

## Database Setup
1. **Configure the Database**: Ensure you have a PostgreSQL database set up and running.
2. **Environment Variables**: Create a `.env` file in the root directory and include the following details:
    ```env
    DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
    ```
    Replace `<username>`, `<password>`, `<host>`, `<port>`, and `<database>` with your database credentials.
3. **Run Migrations**: Apply the database schema using Prisma migrations:
    ```bash
    npx prisma migrate dev
    ```
4. **Verify Connection**: Test the database connection by running the application:
    ```bash
    npm start
    ```

## Stack Used
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Others**: Prisma ORM, dotenv for environment variables
- **Collaboration tools**: Git, GitHub

## Contribution
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request for review.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
