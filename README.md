# The Cognitive Distortion Journal (CDJ)

The Cognitive Distortion Journal (CDJ) is a smart journaling tool designed to assist in addressing distorted thinking patterns. It can often be challenging to practice Cognitive Behavioral Therapy (CBT) techniques, which involve identifying distorted thoughts and reframing them, especially when cognitive distortions are actively happening. The CDJ simplifies this process by employing AI to recognize cognitive distortions and guide you in reframing your thoughts effectively.

**Contents**

- [The Cognitive Distortion Journal (CDJ)](#the-cognitive-distortion-journal-cdj)
  - [Technical Overview](#technical-overview)
  - [Project Requirements](#project-requirements)
  - [How to Run the Project Locally](#how-to-run-the-project-locally)
    - [Prerequisites](#prerequisites)
      - [1. Install Node.js and npm](#1-install-nodejs-and-npm)
      - [2. Install MongoDB](#2-install-mongodb)
      - [3. Install Redis (Optional)](#3-install-redis-optional)
      - [4. Set up External Services](#4-set-up-external-services)
    - [Steps](#steps)
      - [1. Clone the Repository](#1-clone-the-repository)
      - [2. Install Dependencies](#2-install-dependencies)
      - [3. Create Frontend `.env`](#3-create-frontend-env)
      - [4. Create Backend `.env`](#4-create-backend-env)
      - [5. Seed the Database](#5-seed-the-database)
      - [6. Run the Servers](#6-run-the-servers)
  - [Running Tests](#running-tests)
  - [Linting](#linting)
  - [Contributing](#contributing)

## Technical Overview

The CDJ is a full-stack web application built on the MERN stack (MongoDB, Express, React, Node.js). The frontend is built with React, Material UI and Vite, and the backend is built with Node.js and Express.

The application uses MongoDB as its database and Redis for session management. Nodemailer is used to send emails for account verification and password reset. Passport and JWT are used for authentication. Jest is used for testing and ESLint is used for linting.

OpenAI's completions API is used to analyze journal entries for cognitive distortions, provide feedback on how to reframe them, and additional conversational support.

## Project Requirements

- Node.js >= v20.9.0
- npm >= 10.1.0
- MongoDB >= v7.0.2

## How to Run the Project Locally

### Prerequisites

#### 1. Install Node.js and npm

Download the installer from the official Node.js website: https://nodejs.org/en/download/

#### 2. Install MongoDB

For macOS, install MongoDB using Homebrew:

```sh
# Install Homebrew
brew tap mongodb/brew
brew install mongodb-community@5.0

# To start the MongoDB server after installation
brew services start mongodb-community@5.0

# Verify that MongoDB is running
brew services list
```

For Windows, install MongoDB using the MSI installer from the official MongoDB website: https://www.mongodb.com/try/download/community

- After installation, if the MongoDB server is not running, start it by running the following command in the Command Prompt:

```sh
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath="c:\data\db"
```

#### 3. Install Redis (Optional)

Redis is used for session management in production. For local development, you can skip this step and use the default session management provided by Express.

To develop in a production-like environment, follow the instructions below to install Redis.

On macOS, install Redis using Homebrew:

```sh
# Install Homebrew
brew install redis

# To start the Redis server after installation
brew services start redis

# Verify that Redis is running
brew services list
```

On Windows, install Redis using the MSI installer from the official Redis website: https://redis.io/download

- After installation, if the Redis server is not running, start it by running the following command in the Command Prompt:

```sh
"C:\Program Files\Redis\redis-server.exe"
```

Once Redis is installed, run the project in production mode by setting `NODE_ENV` to `production` in the `.env` file in the backend directory. See [Create Backend `.env`](#4-create-backend-env) for more information.

#### 4. Set up External Services

- Sign up for an OpenAI account and create an API key: https://platform.openai.com/signup
- Set up a Gmail account for SMTP: https://www.saleshandy.com/smtp/gmail-smtp-settings/

### Steps

#### 1. Clone the Repository

```sh
git clone https://github.com/hiyaryan/the-cdj
```

This project uses git and GitHub for version control and collaboration. If you are unfamiliar with git or GitHub, see the [Git Handbook](https://git-scm.com/book/en/v2) and [GitHub Docs](https://docs.github.com/en/get-started/start-your-journey/about-github-and-git) for more information.

#### 2. Install Dependencies

```sh
cd the-cdj
npm install
```

If you encounter an error, ensure that Node.js and npm are installed correctly. See [Install Node.js and npm](#1-install-nodejs-and-npm) for instructions on how to install Node.js and npm.

#### 3. Create Frontend `.env`

Create a file named `.env` in the frontend directory and add the following environment variables:

```sh
VITE_RELEASE_PHASE=beta # Determines which code paths to execute based on the release phase
VITE_ACCESS_URL=http://localhost:3000/access # Used for API requests
VITE_ENTRIES_URL=http://localhost:3000/journals/ # Used for API requests
```

#### 4. Create Backend `.env`

Create a file named `.env` in the backend directory and add the following environment variables:

_Ensure you replace items in angle brackets '<>' with your own values._

```sh
NODE_ENV=development # Default environment is development
RELEASE_PHASE=beta # Determines which code paths to execute based on the release phase
DOMAIN=<LAN_IPv4_ADDRESS> # (or localhost) Used to construct magic link URLs
PORT=3000 # Used to construct magic link URLs
ORIGIN_SELF=http://localhost:5173 # Used for CORS
ORIGIN_LOCAL=http://<LAN_IPv4_ADDRESS>:5173 # Used for CORS
TOKENIZED_URL=http://<LAN_IPv4_ADDRESS>:5173 # Used to construct magic link URLs
MONGODB_URI=mongodb://localhost:27017 # Used for connecting to MongoDB
OPENAI_API_URL=https://api.openai.com/v1 # Used for requests to OpenAI completions API
OPENAI_API_KEY=<OPENAI_API_KEY> # Used for requests to OpenAI completions API
SESSION_SECRET=<SESSION_SECRET> # Used for session management
JWT_SECRET=<JWT_SECRET> # Used for JWT authentication
SMTP_HOST=smtp.gmail.com # Used for sending emails (see below for Gmail setup)
SMTP_USER=<SMTP_USER> # Username for SMTP_HOST
SMTP_PASS=<SMTP_PASS> # Password for SMTP_USER
SMTP_NAME=<SMTP_NAME> # Name for emails sent from SMTP_USER
ADMIN_INBOX=<ADMIN_INBOX> # Email address for admin inbox
SUPPORT_INBOX=<SUPPORT_INBOX> # Email address for support inbox
SYSTEM_INBOX=<SYSTEM_INBOX> # Email address for system inbox
REDIS_HOST=localhost # Used for session management
REDIS_PORT=6379 # Used for session management
```

#### 5. Seed the Database

```sh
node backend/data/seed.js
```

_If you encounter an error, ensure that the MongoDB server is running._ See [Install MongoDB](#2-install-mongodb) for instructions on how to start the MongoDB server after installation.

#### 6. Run the Servers

Run the dev servers from the root directory.

```sh
npm run dev
```

This project uses `concurrently` to run the frontend and backend servers at the same time. The command above installs the dependencies then launches their respective servers. The frontend Vite server runs on port 5173 and the backend Nodemon server runs on port 3000.

Alternatively, you can run the frontend and backend servers separately by navigating to their respective directories and running the start command:

```sh
cd frontend
npm run dev
```

```sh
cd backend
npm run dev
```

Open the project in your browser at http://localhost:5173 (or http://<DOMAIN>:5173 if you are using a LAN IP address).

## Running Tests

Each directory has its own tests. To run the tests for a specific directory, navigate to that directory and run the test command:

```sh
npm run test
```

## Linting

Each directory has its own linting configuration. To run the linter for a specific directory, navigate to that directory and run the lint command:

```sh
npm run lint
```

## Contributing

Contributions are welcome!

Please read the [CONTRIBUTING.md](https://github.com/hiyaryan/the-cdj/blob/main/CONTRIBUTING.md) file for more information on how to contribute to this project.

If you're interested in becoming a core member of our organization, feel free to connect with the project owner, Ryan Meneses, on [LinkedIn](https://www.linkedin.com/in/ryan-james-meneses/).

Thank you for your interest in The CDJ! 🌟
