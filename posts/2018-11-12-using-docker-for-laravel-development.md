---
title: 'Using Docker for Laravel Development'
date: 2018-11-12T07:25:42.911Z
description: 'How to setup a docker-compose file to develop a laravel application.'
tags:
  - Laravel
  - Docker
  - DevOps
image: '../../img/docker-social.png'
layout: layouts/post.njk
---

Docker can be a good replacement for [Homestead](https://laravel.com/docs/master/homestead) and [Valet](https://laravel.com/docs/master/valet) when developing a project that needs to be shared with developers working on different operating systems (Linux, Windows, MacOS) and having special requirements not covered by installing homestead. With smaller projects, Valet works fine, and Homestead can support larger projects due to preinstalled packages both of them have limitations. For Valet it's the issue of installing all the project's dependencies on a local machine which must be reinstalled to accommodate specific requirements. And Homestead is bulky, slow, includes a lot of unnecessary packages.

Docker in a way follows the "Composition over inheritance" principle by providing necessary smaller images to compose an environment instead of using a prebuilt monolith with bloat.

## docker-compose cheatsheet

**Note:** you need to `cd` first to where your `docker-compose.yml` is located.

- Start containers in the background: `docker-compose up -d`
- Start containers on the foreground: `docker-compose up`. You will see a stream of logs for every container running.
- Stop containers: `docker-compose stop`
- Kill containers: `docker-compose kill`
- View container logs: `docker-compose logs`
- Execute command inside of container: `docker-compose exec SERVICE_NAME COMMAND` where `COMMAND` is whatever you want to run. Examples:
  - Open shell, `docker-compose exec nginx sh`
  - Run migrations, `docker-compose exec php php artisan migrate`
  - Open psql shell, `docker-compose exec postgres sudo -u postgres psql postgres`

## Basic Setup

To get started Laravel requires three basics: a web-server, a database and php. I will be using Nginx, PHP-FPM and PostgreSQL.

Minimal `docker-compose.yml` for docker:

I will be using `alpine` images to speed-up download times. And pre-built `jguyomard/laravel-php:7.2` image, which includes all the necessary Laravel dependencies. It is possible to add extra packages and build your own `php` image. Just copy this [Dockerfile](https://hub.docker.com/r/jguyomard/laravel-php/~/dockerfile/) and modify as needed. Here is a good example on [ElisDN Laravel Demo](https://github.com/ElisDN/laravel-demo-board/blob/f44e8d3bc6416a16a42f1fa408d1a20b730b0491/docker-compose.yml#L4-L6). But I prefer images stored in the [hub.docker.com](https://hub.docker.com) as it removes the build step.

Notice that `${}` syntax is used to extract environment variables from `.env` file. And that I've created a `docker` folder with additional configuration files.

```yaml
version: "3"
services:
  nginx:
    image: nginx:1.15-alpine
    volumes:
      - .:/var/www/
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    ports:
      - 8080:80
    depends_on:
      - php
      - postgres
  php:
    image: jguyomard/laravel-php:7.2
    volumes:
      - ./:/var/www/
      - $HOME/.composer/:$HOME/.composer/
    environment:
      - DB_HOST=${DB_HOST}
      - DB_DATABASE=${DB_DATABASE}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
  postgres:
    image: postgres:11-alpine
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - 5432:5432
    volumes:
      - postgres-data:/var/lib/postgresql/data
volumes: postgres-data:
```

And `default.conf` for nginx:

Here `root /var/www/public;` must correspond to previously configured `volume` in `docker-compose.yml`. And `php` name in `fastcgi_pass php:9000;` line will be the one used to indicate the `php` service. For example if there are multiple php services `php-cli` and `php-fpm` this line will be `fastcgi_pass php-fpm:9000;`.

```nginx
server {
    listen 80;
    index index.php index.html;
    root /var/www/public;
    client_max_body_size 32M;

    location / {
        try_files $uri /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}
```

## Adding Extras

Once the basic development environment is setup it is possible to add additional images: `node` to build front-end assets, `redis` for caching, `mailhog` to catch outbound email, `elasticsearch` for speeding up search and doing analytics.

```yaml
version: '3'
services:
  nginx:
    image: nginx:1.15-alpine
    volumes:
      - .:/var/www/
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    ports:
      - 8080:80
    depends_on:
      - php
      - postgres
  php:
    image: jguyomard/laravel-php:7.2
    volumes:
      - ./:/var/www/
      - $HOME/.composer/:$HOME/.composer/
    environment:
      - DB_HOST=${DB_HOST}
      - DB_DATABASE=${DB_DATABASE}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
  postgres:
    image: postgres:11-alpine
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - 5432:5432
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/conf/postgres/:/docker-entrypoint-initdb.d/
  node:
    image: node:10.13-alpine
    volumes:
      - ./:/var/www
    working_dir: /var/www
    tty: true
  redis:
    image: redis:5.0
    ports:
      - 6379:6379
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - 1025:1025
      - 8025:8025
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.4.3
    environment:
      - bootstrap.memory_lock=true
      - 'ES_JAVA_OPTS=-Xms128m -Xmx128m'
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - elastic-data:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
volumes:
  postgres-data:
  elastic-data:
```

### Services exposed outside your environment

You can access your application via **`localhost`**.

| Service              | Address outside containers              |
| -------------------- | --------------------------------------- |
| Webserver (Nginx)    | [localhost:8080](http://localhost:8080) |
| Mailhog (WebUI)      | [localhost:8025](http://localhost:8025) |
| PostgreSQL (DB)      | [localhost:5432](http://localhost:5432) |
| ElasticSearch (REST) | [localhost:9200](http://localhost:9200) |
| Redis (CLI)          | [localhost:6379](http://localhost:6379) |

### Hosts within your environment

You'll need to configure your application to use any services you enabled:

| Service        | Hostname      | Port number | Description                          |
| -------------- | ------------- | ----------- | ------------------------------------ |
| PHP-fpm        | php           | 9000        | Used for nginx, composer and artisan |
| SMTP (Mailhog) | mailhog       | 1025        | Catch outbound mail                  |
| HTTP (Mailhog) | mailhog       | 8025        | Access a WebUI to view caught email  |
| Node           | node          | 8081        | Build assets for frontend            |
| PostgreSQL     | postgres      | 5432        | Application database                 |
| Redis          | redis         | 6379        | Cache service                        |
| ElasticSearch  | elasticsearch | 9200        | Search service                       |

## Recommendations

Here are some tips on using docker:

- Run composer outside of the php container (if applicable), as doing so would install all your dependencies owned by `root` within your vendor folder.
- Run commands (ie Symfony's console, or Laravel artisan) straight inside of your container. You can easily open a shell as described above and do your thing from there.
- On MacOS Docker is slow. This guide on [laradock](https://laradock.io/#improve-speed-on-macos) might help. Another solution is described on [medium](https://medium.com/@sean.handley/how-to-set-up-docker-for-mac-with-native-nfs-145151458adc).
