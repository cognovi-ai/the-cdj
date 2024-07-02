### Building and running your application
These are the instructions for deploying the CDJ to your local development environment.

git clone https://github.com/hiyaryan/the-cdj

## Install Dependencies
```sh
cd the-cdj/backend
npm install
```

If you encounter an error, ensure that Node.js and npm are installed correctly. See [Install Node.js and npm](#1-install-nodejs-and-npm) for instructions on how to install Node.js and npm.

## Create Frontend `.env` 
Create a file named `.env` in the frontend directory and add the following environment variables:
```sh
VITE_RELEASE_PHASE=beta # Determines which code paths to execute based on the release phase
VITE_ACCESS_URL=http://localhost:3000/access # Used for API requests
VITE_ENTRIES_URL=http://localhost:3000/journals/ # Used for API requests
```

## Create Backend `.env`
Create a file named `.env` in the backend directory and add the following environment variables:

*Ensure you replace items in angle brackets '<>' with your own values.*

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

When you're ready, cd to the project root directory and start the application by running:
`docker compose up --build`.

Wait for the mongodb container to start running. Once it's up,
run `node backend/data/seed.js` to seed the container.
This only needs to be run once because the service uses
a volume to persist data on the host.

Your application will be available at http://localhost:5173.

### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)

