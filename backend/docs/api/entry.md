# API Documentation for Journal Entry Management

This documentation outlines the API routes and their associated functionalities for managing journal entries. Each route is part of a larger journal entry management system and is designed to handle specific aspects of journal entries within a journal.

## Base URL

All routes are prefixed with `/journals/:journalId/entries`. The `:journalId` is a dynamic parameter representing the ID of the journal.

## Routes

### Get All Entries

- Path: `GET /`
- Description: Retrieves all entries from a specific journal.
- Parameters:
  - `journalId` (path parameter): ID of the journal.
- Response:
  - `200 OK`: Success, returns a list of journal entries.
- Middleware:
  - `isAuthenticated`: Ensures the user is authenticated.

### Add New Entry

- Path: `POST /`
- Description: Adds a new entry to the journal.
- Parameters:
  - `journalId` (path parameter): ID of the journal.
  - `Entry` (request body): The entry data to be added.
- Response:
  - `201 Created`: Success, the new entry is added.
- Middleware:
  - `isAuthenticated`: Ensures the user is authenticated.
  - `validateEntry`: Validates the entry data.

### Get Single Entry

- Path: `GET /:entryId`
- Description: Retrieves a specific entry from the journal.
- Parameters:
  - `journalId` (path parameter): ID of the journal.
  - `entryId` (path parameter): ID of the entry.
- Response:
  - `200 OK`: Success, returns the requested entry.
- Middleware:
  - `isAuthenticated`: Ensures the user is authenticated.

### Update Entry

- Path: `PUT /:entryId`
- Description: Updates an existing journal entry.
- Parameters:
  - `journalId` (path parameter): ID of the journal.
  - `entryId` (path parameter): ID of the entry.
  - `Entry` (request body): Updated data for the entry.
- Response:
  - `200 OK`: Success, the entry is updated.
- Middleware:
  - `isAuthenticated`: Ensures the user is authenticated.
  - `validateEntry`: Validates the updated entry data.

### Delete Entry

- Path: `DELETE /:entryId`
- Description: Deletes a specific entry from the journal.
- Parameters:
  - `journalId` (path parameter): ID of the journal.
  - `entryId` (path parameter): ID of the entry to be deleted.
- Response:
  - `200 OK`: Success, the entry is deleted.
- Middleware:
  - `isAuthenticated`: Ensures the user is authenticated.

## Error Handling

- `400 Bad Request`: Occurs when the request is malformed or missing required fields.
- `401 Unauthorized`: Occurs when the user is not authenticated or lacks permission for the requested operation.
- `404 Not Found`: Occurs when a specified journal or entry does not exist.