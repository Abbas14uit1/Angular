# Routes

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Tips](#tips)
- [Uploading to Mongo](#uploading-to-mongo)
  - [Backend flow of GET requests](#backend-flow-of-get-requests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Tips
- Always use plural routes (`/games/10` NOT `/game/10`)
- Follow REST guidelines as closely as possible. The [Microsoft API guidelines](https://github.com/Microsoft/api-guidelines) are a good reference.
- REST should be stateless; in other words, paths that require validation should have their validation details sent with each request rather than creating a session for that request.
  - In other words, any request containing authentication info should work, even if no request to `login` has been previously made.

## Uploading to Mongo

XML files are sent to the server through a `POST` request to `api_v1/upload`; the filetype is `multipart/form-data` and the file should be included in the field named `file`.

Once the file has reached the server, the server uses the route handler associated with `/upload`. This handler makes sure the upload request is valid, then starts the import process by creating an instance of the StatcrewImporter class.

Uploading data was done via a `POST` requent; by comparison, getting data uses a `GET` request directed at the resource we want information about.
For example, to get information about all games, we'd sent a `GET` request to `/games`; to get information about a particular game, we'd send a GET request to `/games/1` (for the game with ID of 1).

### Backend flow of GET requests
Each resource that we want users to get information about is given its own folder in the `api_v1` folder, to allow space for growth.
Look at `api_v1/apiIndex.route.ts` for an overview on what routes are defined.
Each route handler inherits prefixes from the parent; i.e. the `apiIndex.route.ts` file can only be reached by going through `example.com/api_v1`.
Likewise, since all game routes are defined relative to `apiIndex.route.ts`, you **cannot** access `example.com/games/1`; instead, game information is accessed via `example.com/api_v1/games/1`.

When the GET request comes in, Express passes it along to the appropriate handler. Once the handler is found, the function defined by that handler is used to process the GET request.
Look at various route files for an overview on how `req.params` and   `req.query` work.
In short, it looks that the URL for the route you have defined and adds the value of any property (where properties are preceeded by a colon) to `req.params`.
For example, `GET /api_v1/games/1` will match the `/api_v1/games/:id` route the value of `1` can be accessed via `req.params.id`.
Having the ID available as a variable allows us to pass it on to our Mongo queries; we can ask Mongo to get us all records where the ID matches the passed ID.

`api_v1/games/games.route.ts` has an examle of both getting a game by ID (using the `req.params.id` method), and getting all games, which is done in Mongo by calling `.find()` with no query parameters.
