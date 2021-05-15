---
title: "Easy Development Certificates (SSL/TLS) for Spring Boot"
date: 2021-05-15T23:17:18+03:00
description: "Using mkcert to generate locally-trusted development certificates for Spring"
draft: false
toc: false
images:
tags:
  - Spring
  - Development
---

Lately I've been digging into Spring Security by reading a book "Spring Security in Action" by Laurentiu Spilca.

In the 2nd chapter we are given an example of how to use HTTPS with spring boot:

1. Generate a certificate: `openssl req -newkey rsa:2048 -x509 -keyout key.pem -out cert.pem -days 365`
2. Convert it to 'p12' format: `openssl pkcs12 -export -in cert.pem -inkey key.pem -out certificate.p12 -name "certificate"`
3. Copy the generated 'certificate.p12' file inside 'src/main/resources' directory.
4. Update 'application.properties':

    ```properties
    server.ssl.key-store-type=PKCS12
    server.ssl.key-store=classpath:certificate.p12
    server.ssl.key-store-password=12345
    ```

One problem with this approach is that such certificates are not recognized by browsers, which will show an indicator that "this certificate is not trustworthy".

An easy workaround involves using a tool **mkcert**: https://github.com/FiloSottile/mkcert

With simple installation for macOS as an example:

```bash
# Install
brew install mkcert
brew install nss # if you use Firefox

# Setup local certificate authority (CA)
mkcert -install

# Generate certificate
mkcert -pkcs12 localhost 127.0.0.1
```

This will generate a new p12 ('localhost+2.p12') certificate for localhost and 127.0.0.1 in current directory that will be registered in local certificate authority (CA) which will keep browsers happy when doing local development.

The rest of the steps is the same, copy into 'src/main/resources' and update 'application.properties'.
