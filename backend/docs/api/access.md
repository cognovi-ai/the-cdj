# API Documentation for User Access Management

This documentation details the API routes related to user access management, including user authentication and journal access control.

## Base URL

All routes under this category are prefixed with `/access`.

## Routes

### User Login

- Path: `POST /login`
- Description: Authenticates a user and initiates a session.
- Parameters:
  - `UserCredentials` (request body): The user's login credentials.
- Response:
  - `200 OK`: Successful login, returns user session info.
  - `401 Unauthorized`: Login failed, invalid credentials.
- Middleware:
  - `validateLogin`: Validates the login credentials.

### User Logout

- Path: `GET /logout`
- Description: Logs out the user and ends the session.
- Response:
  - `200 OK`: Successful logout.

### User Registration

- Path: `POST /register`
- Description: Registers a new user in the system.
- Parameters:
  - `UserDetails` (request body): The information of the user to be registered.
- Response:
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Registration failed due to invalid data.
- Middleware:
  - `validateRegistration`: Validates the registration data.

## Error Handling

- `400 Bad Request`: Occurs when the request data is invalid or incomplete.
- `401 Unauthorized`: Occurs when authentication fails or the user is not authorized for a certain action.
- `404 Not Found`: Occurs when a requested resource is not found.

## Middleware

- `validateLogin`: Validates the user's login credentials.
- `validateRegistration`: Ensures the registration data meets the required criteria.