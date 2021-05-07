---
title: "Multiple PostgreSQL Databases in Docker"
description: "Using shell script to create multiple databases for Postgres in Docker"
date: 2021-05-07T17:06:12+03:00
toc: false
tags:
  - Development
  - PostgreSQL
  - Docker
---

When using Postgres in docker-compose sometimes I have a need to create multiple databases for a demo project, but sadly only a `POSTGRES_DB` environment variable is available for a single database.

Luckily it's possible to define an initialization script that can help us out.

Here's how my `docker-compose.yml` looks:

- A directory `pg-init-scripts` that contains the initialization script is mounted into the docker container
- A custom environment variable `POSTGRES_MULTIPLE_DATABASES` is created with database names to be initialized

```yml
version: '3.8'
services:
  postgres:
    image: 'postgres:13.2-alpine'
    container_name: postgres
    ports:
      - 5432:5432
    volumes:
      - ./pg-init-scripts:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=root
      - POSTGRES_MULTIPLE_DATABASES=accounts,bills,deposits
```

Now inside `pg-init-scripts` there is this script:

- Inside the script `POSTGRES_USER` is used as root user
- While `POSTGRES_MULTIPLE_DATABASES` is split on `,`

```bash
#!/bin/bash

set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
      CREATE USER $database;
      CREATE DATABASE $database;
      GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Creating databases: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
        create_user_and_database "$db"
    done
    echo "Multiple databases created"
fi
```

Try it out and see if it helps you.

Here's the reference to PostgreSQL Docker image: [https://hub.docker.com/_/postgres/](https://hub.docker.com/_/postgres/) with more information about initialization scripts.
