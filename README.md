# Ksahlos Photography — Backend

A REST API powering a photography portfolio. It handles image uploads, organizes them into ordered collections, exposes a public read API for the portfolio site, and locks down every write behind JWT-authenticated admin routes.

Images aren't stored on the server — they're streamed to [Cloudinary](https://cloudinary.com) on upload, and only the resulting URL + asset id are saved in MySQL. The app ships as a Docker image that's built and published to Docker Hub automatically on every push to `main`.

> This is the backend repository. The React frontend that consumes this API lives in a separate repository.

## Built with

[![typescript-shield]][typescript-url]
[![node-shield]][node-url]
[![express-shield]][express-url]
[![mysql-shield]][mysql-url]
[![prisma-shield]][prisma-url]
[![jwt-shield]][jwt-url]
[![cloudinary-shield]][cloudinary-url]
[![docker-shield]][docker-url]
[![github-actions-shield]][github-actions-url]

To see the version of each dependency, check the `package.json` file

## API Reference

The API is split into a **public** surface (read-only, consumed by the portfolio site) and a **protected** surface (writes, guarded by the `authenticate` middleware). Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

Base URL: `/api`

### Health

| Method | Endpoint  | Auth | Description                                 |
| ------ | --------- | :--: | ------------------------------------------- |
| `GET`  | `/health` |  —   | Liveness check; does not touch the database |

### Auth

| Method | Endpoint      | Auth | Description                       |
| ------ | ------------- | :--: | --------------------------------- |
| `POST` | `/auth/login` |  —   | Authenticate admin, returns a JWT |

### Photos

| Method   | Endpoint            | Auth | Description                                      |
| -------- | ------------------- | :--: | ------------------------------------------------ |
| `GET`    | `/photos`           |  —   | List photos                                      |
| `POST`   | `/photos`           |  🔒  | Upload a new photo (multipart `image`)           |
| `PATCH`  | `/photos/rearrange` |  🔒  | Reorder photos                                   |
| `PATCH`  | `/photos/:id`       |  🔒  | Update a photo (optionally replace the image)    |
| `DELETE` | `/photos/:id`       |  🔒  | Delete a photo (also removes it from Cloudinary) |

### Collections

| Method   | Endpoint                 | Auth | Description                         |
| -------- | ------------------------ | :--: | ----------------------------------- |
| `GET`    | `/collections`           |  —   | List collections                    |
| `GET`    | `/collections/:slug`     |  —   | Get a single collection by its slug |
| `POST`   | `/collections`           |  🔒  | Create a collection                 |
| `PATCH`  | `/collections/rearrange` |  🔒  | Reorder collections                 |
| `PATCH`  | `/collections/:id/cover` |  🔒  | Set the collection cover photo      |
| `PATCH`  | `/collections/:id`       |  🔒  | Update a collection                 |
| `DELETE` | `/collections/:id`       |  🔒  | Delete a collection                 |

### Awards

| Method   | Endpoint            | Auth | Description                          |
| -------- | ------------------- | :--: | ------------------------------------ |
| `GET`    | `/awards`           |  —   | List awards                          |
| `POST`   | `/awards`           |  🔒  | Upload a new award image (multipart) |
| `PATCH`  | `/awards/rearrange` |  🔒  | Reorder awards                       |
| `DELETE` | `/awards/:id`       |  🔒  | Delete an award                      |

## Folder Structure

Below is a high-level overview of the project's `src/` folder structure:

```bash
src/
├── config/       # Prisma client + Cloudinary connection setup
├── controllers/  # HTTP handlers that pass request to service
├── middleware/   # JWT auth guard, rate limiting, response serialization, error handler
├── routes/       # Express route definitions
├── services/     # Business logic and external service calls
├── types/        # Shared TypeScript types
└── utils/        # Helpers
```

The Prisma schema lives outside `src/`, in `prisma/schema.prisma`, alongside `prisma.config.ts`.

The codebase follows a **route → controller → service** layering, with the database schema defined in `prisma/schema.prisma`.

Routes wire up middleware and map to controllers, controllers handle the HTTP layer, and services hold the actual business logic and talk to MySQL (through Prisma) and Cloudinary.

## Development

### Prerequisites

Make sure you have the following installed on your machine:

- NodeJS: Download by visiting [NodeJS website](https://nodejs.org/en/download/)
- Git: Download by visiting [Git website](https://git-scm.com/downloads)
- Docker Desktop (optional): Download by visiting [Docker website](https://www.docker.com/products/docker-desktop/)

You'll also need a MySQL (or MariaDB) database and a free [Cloudinary](https://cloudinary.com) account for image hosting.

To check if NodeJS, Git, and Docker are installed, run the following commands in your terminal:

```bash
node -v
git --version
docker --version
```

### 1. Clone the repository

```bash
git clone https://github.com/iliassachlos/ksahlos-backend.git
```

### 2. Install dependencies

```bash
cd ksahlos-backend
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `PORT`                  | Port the server listens on (defaults to `8080`) |
| `DATABASE_URL`          | MySQL connection string                         |
| `ALLOWED_ORIGINS`       | Comma-separated list of origins allowed by CORS |
| `JWT_SECRET`            | Secret used to sign and verify JWTs             |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                              |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                           |

### 4. Create the database schema

```bash
npm run db:push
```

This creates the tables described in `prisma/schema.prisma`. It also generates the Prisma client; run `npm run db:generate` on its own after changing the schema.

### 5. Start the development server

```bash
npm run dev
```

This runs the app with `tsx watch` for live reload. The server will be available at `http://localhost:8080` (or whatever `PORT` you set).

### Available scripts

| Script          | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Start the dev server with live reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` (`tsc`)               |
| `npm start`     | Run the compiled app from `dist/`                   |
| `npm run db:generate` | Generate the Prisma client from the schema    |
| `npm run db:push`     | Push the schema to the database (no migration files) |
| `npm run db:migrate`  | Apply migrations (`prisma migrate deploy`)    |
| `npm run db:studio`   | Open Prisma Studio, a GUI for the data        |

## Docker

The app ships as a production-ready image built from a `Dockerfile`.

### Build and run locally

```bash
# Build the image
docker build -t ksahlos-backend .

# Run it (pass your env file through)
docker run --env-file .env -p 8080:8080 ksahlos-backend
```

### Architecture

The `Dockerfile` uses a **two-stage build** on `node:22-alpine`:

- **Builder stage** — installs all dependencies and compiles the TypeScript to `dist/`
- **Production stage** — installs only production dependencies and copies over the compiled `dist/`, keeping the final image small

The container exposes port `8080` and runs `node dist/app.js`.

### Published image

Available on Docker Hub, published automatically on every push to `main`:

- `eliassah/ksahlos-backend:latest`

## CI/CD

One workflow in `.github/workflows/docker.yml`:

**`docker.yml`** — runs on every push to `main`:

- Logs in to Docker Hub using repository secrets
- Builds the Docker image from the multi-stage `Dockerfile`
- Pushes the image to Docker Hub tagged `latest`

## What I learned

- Structuring an Express + TypeScript API with clean route → controller → service layering and centralized error handling
- Uploading images with Multer and storing them on Cloudinary
- Securing write operations with JWT authentication middleware while keeping the read API public
- Writing a multi-stage Dockerfile and automating image builds + Docker Hub publishing with GitHub Actions

<!-- MARKDOWN IMAGES -->

[typescript-shield]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[node-shield]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[express-shield]: https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white
[mysql-shield]: https://img.shields.io/badge/MySQL-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white
[prisma-shield]: https://img.shields.io/badge/Prisma-2D3748.svg?style=for-the-badge&logo=prisma&logoColor=white
[jwt-shield]: https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white
[cloudinary-shield]: https://img.shields.io/badge/Cloudinary-%233448C5.svg?style=for-the-badge&logo=cloudinary&logoColor=white
[docker-shield]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[github-actions-shield]: https://img.shields.io/badge/GitHub%20Actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white

<!-- MARKDOWN LINKS -->

[typescript-url]: https://www.typescriptlang.org/
[node-url]: https://nodejs.org/
[express-url]: https://expressjs.com/
[mysql-url]: https://www.mysql.com/
[prisma-url]: https://www.prisma.io/
[jwt-url]: https://jwt.io/
[cloudinary-url]: https://cloudinary.com/
[docker-url]: https://www.docker.com/
[github-actions-url]: https://github.com/features/actions
