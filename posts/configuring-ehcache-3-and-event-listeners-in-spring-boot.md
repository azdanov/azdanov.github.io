---
title: 'Configuring EhCache 3 and Event Listeners in Spring Boot'
date: 2020-09-19T06:32:29.468Z
description: 'How to programmatically configure EhCache 3 with Event Listeners in Spring Boot.'
tags:
  - Spring
  - Development
  - Configuration
layout: layouts/post.njk
---

__TLDR:__ You can jump straight to an example project [azdanov/ehcache-config-demo](https://github.com/azdanov/ehcache-config-demo).

Spring offers amazing caching utilities. Throw in some `@EnableCaching`, `@Cacheable`, `@CacheEvict` on  and the results will be cached. You can read more about Spring Caching on [https://www.baeldung.com/spring-cache-tutorial](https://www.baeldung.com/spring-cache-tutorial).

The problem that I encountered was figuring out how to use EhCache 3 (`org.ehcache`) and inside Spring Boot with Java Based Configuration. A lot of how-to guides were either showing `ehcache.xml` or an older EhCache 2 (`net.sf.ehcache`) configuration convention.

Let's see how to do configure EhCache 3 <mark>programmatically</mark>.

## Setup

First step is adding required dependencies to the project (Maven/Gradle):

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
    <dependency>
        <groupId>org.ehcache</groupId>
        <artifactId>ehcache</artifactId>
        <version>3.9.0</version>
    </dependency>
    <dependency>
        <groupId>javax.cache</groupId>
        <artifactId>cache-api</artifactId>
        <version>1.1.1</version>
    </dependency>
</dependencies>
```
or
```groovy
// build.gradle
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-cache'
  implementation 'org.ehcache:ehcache:3.9.0'
  implementation 'javax.cache:cache-api:1.1.1'
}
```

## Configuration

Next step would be creating a configuration class:

```java/27,43/
package org.js.azdanov.ehcacheconfigdemo.configuration;

import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ExpiryPolicyBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.jsr107.Eh107Configuration;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.cache.Cache;
import javax.cache.CacheManager;
import javax.cache.configuration.CacheEntryListenerConfiguration;
import javax.cache.configuration.Factory;
import javax.cache.configuration.FactoryBuilder;
import javax.cache.configuration.MutableCacheEntryListenerConfiguration;
import javax.cache.event.CacheEntryEventFilter;
import java.time.Duration;

@EnableCaching
@Configuration
public class CacheConfiguration {
    private static final Factory<? extends CacheEntryEventFilter<Integer, Integer>> NO_FILTER = null;
    private static final boolean IS_OLD_VALUE_REQUIRED = false;
    private static final boolean IS_SYNCHRONOUS = true;

    // (1)
    private final javax.cache.configuration.Configuration<Integer, Integer> jcacheConfiguration =
        Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder
                .newCacheConfigurationBuilder(Integer.class, Integer.class, ResourcePoolsBuilder.heap(100))
                .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofMinutes(5)))
                .build()
        );

    CacheEntryListenerConfiguration<Integer, Integer> listenerConfiguration =
        new MutableCacheEntryListenerConfiguration<>(
            FactoryBuilder.factoryOf(CacheListener.class),
            NO_FILTER,
            IS_OLD_VALUE_REQUIRED,
            IS_SYNCHRONOUS);

    // (2)
    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, "worker1");
            createCache(cm, "worker2");
        };
    }

    private void createCache(CacheManager cm, String cacheName) {
        Cache<Integer, Integer> cache = cm.getCache(cacheName);
        if (cache == null) {
            cm.createCache(cacheName, jcacheConfiguration)
                .registerCacheEntryListener(listenerConfiguration);
        }
    }
}
```

1. Here's the configuration itself, which can be modified to read the values from an `application.properties` file or any other resource.
2. Inside `JCacheManagerCustomizer` bean the individual cache creation happens.

I've added some extras where a cache event listener will be registered for each created cache.

Here's how a listener class might look like:

```java
package org.js.azdanov.ehcacheconfigdemo.configuration;

import lombok.extern.slf4j.Slf4j;

import javax.cache.event.CacheEntryCreatedListener;
import javax.cache.event.CacheEntryEvent;

@Slf4j
public class CacheListener implements CacheEntryCreatedListener<Integer, Integer> {

    @Override
    public void onCreated(final Iterable<CacheEntryEvent<? extends Integer, ? extends Integer>> cacheEntryEvents) {
        for (CacheEntryEvent<? extends Integer, ? extends Integer> entryEvent : cacheEntryEvents) {
            log.info("Cached key: {}, with value: {}", entryEvent.getKey(), entryEvent.getValue());
        }
    }
}
```

Now for the last step let's mark methods inside a service with previously defined cache names:

```java
package org.js.azdanov.ehcacheconfigdemo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Random;

@RequiredArgsConstructor
@Service
public class WorkerService {

    private final Random random;

    @Cacheable(value = "worker1", key = "#bound")
    public int getFirstWork(int bound) {
        return random.nextInt(bound);
    }

    @Cacheable(value = "worker2", key = "#bound")
    public int getSecondWork(int bound) {
        return random.nextInt(bound);
    }
}
```

## Last step

It's time to see if this works or not with a simple sanity-check 'test':

```java
package org.js.azdanov.ehcacheconfigdemo;

import lombok.extern.slf4j.Slf4j;
import org.js.azdanov.ehcacheconfigdemo.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.util.Random;

@Slf4j
@EnableCaching
@Configuration
@SpringBootApplication
public class EhcacheConfigDemoApplication {

    @Autowired
    WorkerService workerService;

    public static void main(String[] args) {
        SpringApplication.run(EhcacheConfigDemoApplication.class, args);
    }

    @Bean
    Random random() {
        return new Random();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void afterStartup() {
        log.info("Running!");
        log.info("getFirstWork(100): {}", workerService.getFirstWork(100));
        log.info("getFirstWork(50): {}", workerService.getFirstWork(50));
        log.info("getFirstWork(100): {}", workerService.getFirstWork(100));
        log.info("getFirstWork(50): {}", workerService.getFirstWork(50));
        log.info("getSecondWork(100): {}", workerService.getSecondWork(100));
        log.info("getSecondWork(50): {}", workerService.getSecondWork(50));
        log.info("getSecondWork(100): {}", workerService.getSecondWork(100));
        log.info("getSecondWork(50): {}", workerService.getSecondWork(50));
    }
}
```

This is the result I got in the terminal:

```text
Running!
Cached key: 100, with value: 8
getFirstWork(100): 8
Cached key: 50, with value: 29
getFirstWork(50): 29
getFirstWork(100): 8
getFirstWork(50): 29
Cached key: 100, with value: 6
getSecondWork(100): 6
Cached key: 50, with value: 33
getSecondWork(50): 33
getSecondWork(100): 6
getSecondWork(50): 33
```

Seems to be working 🙂
