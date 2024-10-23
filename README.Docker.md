# Launching the CDJ with Docker Compose

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Configuration](#configuration)
4. [Docker Compose File Overview](#docker-compose-file-overview)
5. [Launching the Application](#launching-the-application)
6. [Accessing the Application](#accessing-the-application)
7. [Stopping the Application](#stopping-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Additional Resources](#additional-resources)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Clone the Repository

First, clone the repository containing the Docker Compose configuration and application files:

```sh
git clone https://github.com/hiyaryan/the-cdj
cd the-cdj
```

## Configuration

Check [README.md](https://github.com/hiyaryan/the-cdj/blob/main/README.md) for .env file templates.

## Docker Compose File Overview

The CDJ is set up as three microservices:

- **mongo**: The MongoDB server
- **backend**: Middleware for connecting to MongoDB
- **frontend**: UI components

MongoDB is run as a replica set with a single instance for local development, and all logs are written to a log file in the `mongo-log` volume instead of the console.

Frontend and backend are configured to hot reload on changes to the source code.

## Launching the Application

### Initializing the Application

When running the CDJ for the first time, or after removing the `mongo-data` volume, you must initiate the MongoDB replica set and seed the database. You can do this by running the `cdj_init.sh` script with the following command:

```sh
bash cdj_init.sh
```

You should see output similar to the following on a successful init:

```
Waiting for mongodb container to start
Initializing replica set
{ ok: 1 }
...
Database has been seeded successfully.
```

### Running the Application

After initializing the CDJ for the first time, you can simply run `docker compose up` to start the containers.

## Accessing the Application

Once the containers are up and running, you can access the CDJ at `http://localhost:5173` (or the port specified in the `compose.yaml` file).

### Accessing Other Services

- **Database**: You can access the MongoDB database using a database client at `localhost:27017` with the `directConnection` option set to `true`.

## Stopping the Application

To stop the running containers, use the following command:

```sh
docker compose down
```

This command stops and removes the containers and networks defined in the `compose.yaml` file.

## Troubleshooting

### Common Issues

- **Container Fails to Start**: Check the logs for the specific container using:
  ```sh
  docker compose logs <service_name>
  ```
  Database logs will be found in the `mongod.log` file in the `mongo-log` volume.
- **Port Conflicts**: Ensure the ports specified in the `compose.yaml` file are not in use by other applications.
- **Environment Variables**: Verify that all required environment variables are correctly set in the `.env` file or `compose.yaml`.

### Additional Logs

To view the logs of a specific service, use:

```sh
docker compose logs <service_name>
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker's Node.js Guide](https://docs.docker.com/language/nodejs/)
