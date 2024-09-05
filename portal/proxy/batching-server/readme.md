# Batching Server

This directory contains a Bun-based batching server for the portal proxy.

### Overview
The proxy server is implemented to bypass CORS-related issues when running the portal locally.

Unlike the browser, the proxy server does not trigger a preflight request, which is initiated by the browser to check permissions for cross-origin resource sharing (CORS). The preflight request can block communication between the portal and the batching server, causing interruptions in the connection.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system

## Getting Started

Run the server:
```
bun run proxy.ts
```