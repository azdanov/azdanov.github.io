---
title: "What is Cloud?"
date: 2022-10-16T20:30:00+03:00
toc: false
tags:
  - Cloud
  - AWS
  - Theory
---

Essential characteristics of a cloud according to [NIST Special Publication 800-145](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf):

1. **On-demand Self-Service**. Can provision capabilities as needed _without requiring human interaction_ with each service provider.
2. **Broad Network Access**. Capabilities are available over the _network_ and accessed through _standard mechanisms_ that promote use by heterogeneous thin or thick client platforms (e.g., mobile phones, laptops, and workstations).
3. **Resource Pooling**. The provider's computing resources are _pooled_ to serve multiple consumers using a _multi-tenant model_, with different physical and virtual resources dynamically assigned and reassigned according to consumer demand. There is a sense of _location independence_ in that the customer generally has no _control_ or _knowledge_ over the exact _location_ of the provided resources but may be able to specify location at a higher level of abstraction (e.g., country, state, or datacenter). Examples of resources include storage, processing, memory, and network bandwidth.
4. **Rapid Elasticity**. Capabilities can be _elastically provisioned_ and _released_, in some cases automatically, to scale _rapidly_ outward and inward commensurate with demand. To the consumer, the capabilities available for provisioning often _appear_ to be _unlimited_ and can be appropriated in any quantity at any time.
5. **Measured Service**. Cloud systems automatically control and optimize resource use by leveraging a metering capability at some level of abstraction appropriate to the type of service (e.g., storage, processing, bandwidth, and active user accounts). Resource usage can be _monitored_, _controlled_, _reported_ and _billed_ providing transparency for both the provider and consumer of the utilized service.

Summary:

1. **On-demand Self-Service**: Create and terminate resources through UI/CLI without human interaction.
2. **Broad Network Access**: Access resources over any network and any device using standard methods.
3. **Resource Pooling**: Due to combining of resources, the provider can offer resources at a lower cost.
4. **Rapid Elasticity**: Automatically scale resources up and down based on demand.
5. **Measured Service**: Usage of resources is measured and billed for what you consume.
