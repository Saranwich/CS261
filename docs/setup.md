# Setup Guide

This guide explains how to install and run CSTU Compass (frontend, backend, MySQL and Redis) using Docker.

## 1. Prerequisites

Install the following tools before starting:

- **Git** — to clone the repository.
- **Docker Desktop** — to build and run Docker containers.

Make sure Docker Desktop is running before executing Docker commands.

## 2. Install (3 steps)

Run every command from the project root (the folder that contains `compose.yaml`).

### Step 1 — Clone

```bash
git clone https://github.com/Saranwich/CS261.git
cd CS261
```

### Step 2 — Create `.env`

```bash
cp .env.example .env
```

Open `.env` and fill in `TU_API_KEY` (the Application-Key from TU REST API). Without it, login fails.

| Variable | Meaning |
|---|---|
| `MYSQL_ROOT_PASSWORD` | MySQL root password (any value) |
| `MYSQL_DATABASE` | Database name, keep `cstucompass` |
| `TU_API_KEY` | TU REST API Application-Key, needed for login |
| `VITE_USE_MOCK` | `false` = the dev frontend calls the real backend, `true` = mock data. Production always uses the real backend |

### Step 3 — Build and start

```bash
docker compose --profile prod up -d --build
```

The first start takes a while: MySQL creates the database, the backend creates the tables,
then the `seed` service loads the curriculum data from `db/seed.sql` and exits.

Open http://localhost and log in with your TU account. You should see 4 courses (CS100, CS101, CS102, CS111).

The `seed` service loads data only when the database has no courses yet, so `up` again never overwrites existing data.
To see what it did:

```bash
docker compose --profile prod logs seed
```

### Reload the curriculum data

When `db/seed.sql` changes, a database that already has data does not get the new version automatically. Load it by hand.
It replaces the curriculum data and keeps users and their progress:

```bash
docker compose cp db/seed.sql mysql:/tmp/seed.sql
docker compose exec mysql sh -c 'mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /tmp/seed.sql'
docker compose exec redis redis-cli del "skillTree::SimpleKey []"
docker compose exec redis sh -c "redis-cli --scan --pattern 'courseDetails*' | xargs -r redis-cli del"
```

The last two commands clear the backend cache, which keeps old results for up to 1 day.

## 3. Profiles

| Profile | Runs | Open |
|---|---|---|
| `dev` | frontend (Vite) + backend (Spring Boot) + MySQL + Redis | http://localhost:5173 |
| `fe-dev` | frontend (Vite) only | http://localhost:5173 |
| `be-dev` | backend (Spring Boot) + MySQL + Redis | http://localhost:8080/api |
| `prod` | frontend (Apache) + backend (Tomcat) + MySQL + Redis | http://localhost |
| `fe-prod` | frontend (Apache) only | http://localhost |
| `be-prod` | backend (Tomcat) + MySQL + Redis | http://localhost:8080/api |

Profiles that include the backend need the `.env` file from Step 2.
Do not run a `dev` and a `prod` profile at the same time: both use ports `8080`, `3306` and `6379`.

`dev` and `prod` share the same database, so the curriculum data loaded by one is there for the other.

## 4. Development Mode

Development mode runs the Vite dev server with Hot Module Replacement, and the Spring Boot backend restarts when `backend/src` changes.

```bash
docker compose --profile dev up -d --build
```

Open http://localhost:5173. Vite forwards `/api` to the backend.
On a new database, the `seed` service loads the curriculum data the same way as in production.

## 5. Useful Docker Commands

```bash
docker compose ps                                  # running containers
docker compose --profile prod logs -f              # follow logs (or --profile dev)
docker compose --profile prod down                 # stop, keep the database
docker compose --profile prod down -v              # stop and DELETE the database
```

## 6. Project Structure

```text
CS261/
├── backend/            Spring Boot (Java 21), packaged as a .war for Tomcat
├── frontend/           React + Vite
├── db/                 seed.sql (curriculum data) + seed-if-empty.sh (used by the seed service)
├── docs/               diagrams and documents
├── Dockerfile.backend
├── Dockerfile.frontend
├── apache.conf         production web server, forwards /api to the backend
├── compose.yaml
└── .env.example
```

## 7. Troubleshooting

### Docker is not running

Start Docker Desktop and wait until the Docker engine is ready.

### Port is already in use

Another application may already be using port `80`, `5173`, `8080`, `3306` or `6379`. Stop it (or the other profile) and start again.

### The page shows no courses

Check `docker compose --profile prod logs seed`. If it says the data was loaded, the backend cache may still hold an empty result:
run the cache commands from "Reload the curriculum data". If the seed service failed, run all of those commands.

### Login fails

Check that `TU_API_KEY` in `.env` is filled in, then recreate the backend:

```bash
docker compose --profile prod up -d --force-recreate backend-prod
```

### The page does not load, or `/api` returns 502

The backend is not running. Check its logs:

```bash
docker compose --profile prod logs --tail=50 backend-prod
```

## 8. Notes

- Development mode uses Vite. Production mode serves the built frontend through Apache.
- The backend creates and updates the tables itself (`spring.jpa.hibernate.ddl-auto=update`).
- Run Docker commands from the project root directory, where `compose.yaml` is located.
