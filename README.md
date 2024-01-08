# The Cognitive Distortion Journal (CDJ)

The Cognitive Distortion Journal (CDJ) is a smart journaling tool designed to assist in addressing distorted thinking patterns. It can often be challenging to practice Cognitive Behavioral Therapy (CBT) techniques, which involve identifying distorted thoughts and reframing them, especially when cognitive distortions are actively happening. The CDJ simplifies this process by employing AI to recognize cognitive distortions and guide you in reframing your thoughts effectively.

**Table of Contents**
- [The Cognitive Distortion Journal (CDJ)](#the-cognitive-distortion-journal-cdj)
  - [Technical Overview](#technical-overview)
  - [Project Requirements](#project-requirements)
  - [How to Run the Project Locally](#how-to-run-the-project-locally)
    - [Setting up Gmail for SMTP](#setting-up-gmail-for-smtp)
  - [Running Tests](#running-tests)
  - [Linting](#linting)
  - [Contributing](#contributing)

## Technical Overview

The project architecture is a full stack MERN application. The frontend is built with React using Material UI and the backend is built with Node.js and Express. The database is MongoDB. The frontend and backend are hosted on separate servers. The frontend is hosted on Vite and the backend is hosted on Nodemon. The frontend and backend communicate via RESTful API calls. The frontend is a SPA and the backend is a RESTful API.

This project is still in development with version 1.0.0 planned for release this month (January 2024) indicating it is ready for production. On release, semantic versioning will be used to track future changes. The project is currently in the alpha stage of development. The project is not yet ready for production use. Once the project is ready for production it will be available at https://thecdj.app.

## Project Requirements

- Node.js v20.9.0
- npm 10.1.0
- MongoDB v7.0.2

## How to Run the Project Locally

1. Clone the repository to your local machine.

```sh
git clone https://github.com/hiyaryan/the-cdj
```

2. Navigate to the project directory.
```sh
cd the-cdj
```

3. Install the project dependencies.
```sh
npm install
```

4. Create a `.env` file in the frontend directory and add the following environment variables:
```sh
VITE_ACCESS_URL=http://localhost:3000/access
VITE_ENTRIES_URL=http://localhost:3000/journals/
```

5. Create a `.env` file in the backend directory and add the following environment variables:

*Ensure you replace items in angle brackets with your own values.*

```sh
DEV_ORIGIN_LOCAL_URL=http://localhost:5173
DEV_ORIGIN_PRIVATE_URL=<PRIVATE_URL> # Used to host on a private server within the same network
OPENAI_API_URL=https://api.openai.com/v1
ENCRYPTION_KEY=<ENCRYPTION_KEY> # Used for encrypting API keys
SESSION_SECRET=<SESSION_SECRET> # Used for session management
JWT_SECRET=<JWT_SECRET> # Used for JWT authentication
OPENAI_API_KEY=<OPENAI_API_KEY> # Used for testing
SMTP_HOST=smtp.gmail.com # Used for sending emails (see below for Gmail setup)
SMTP_USER=<SMTP_USER> # Username for SMTP_HOST
SMTP_PASS=<SMTP_PASS> # Password for SMTP_USER
```

#### Setting up Gmail for SMTP
See the following link for instructions on how to set up a Gmail account for SMTP.

Gmail SMTP Settings https://www.saleshandy.com/smtp/gmail-smtp-settings/

6. Launch the MongoDB server.
```sh
mongod
```

7. Seed the database (optional).
```sh
node backend/data/seed.js
```

8. Run the dev servers
```sh
npm run dev
```

This project uses `concurrently` to run the frontend and backend servers at the same time and install the dependencies using the one command above. The frontend Vite server runs on port 5173 and the backend Nodemon server runs on port 3000.

Open the project in your browser at http://localhost:5173 (or from a different device on your network at http://<PRIVATE_URL>:5173)

## Running Tests
Each directory has its own tests. To run the tests for a specific directory, navigate to that directory and run the test command:
```sh
npm run test
```

## Linting
Each directory has its own linting. To run the linting for a specific directory, navigate to that directory and run the lint command:
```sh
npm run lint
```

## Contributing
Contributions are welcome! 

If you would like to contribute, please reach out to me, Ryan Meneses, on [LinkedIn](#https://www.linkedin.com/in/ryan-james-meneses/). I am happy to connect with you and discuss your ideas.

You can also submit a pull request and I will review it as soon as I can or create an issue to start a discussion about your idea or to report a bug. Thank you!