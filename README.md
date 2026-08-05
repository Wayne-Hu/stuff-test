# Read Later

A monorepo app for saving and reading articles later, with a shared web and mobile frontend backed by a local Express server.

## Project Structure

```
read-later/
├── packages/
│   ├── web/        # Vite + React web app (TypeScript + Tailwind)
│   ├── mobile/     # Expo mobile app (iOS & Android)
│   └── shared/     # Shared business logic
└── server/         # Express mock API server (port 3001)
```

## Prerequisites

- Node.js 20+
- Yarn 1.22.22
- For iOS: Xcode + iOS Simulator + [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

## Setup

Install all dependencies from the root:

```bash
yarn install
```

## Running the App

The server must be running before starting the web or mobile app.

### 1. Start the API server

```bash
# Production
yarn server

# Development (auto-restart on file changes)
yarn server:dev
```

Server runs at `http://localhost:3001`.

### 2. Start the web app

```bash
yarn web
```

Opens the app in your browser at `http://localhost:5173` (Vite dev server).

### 3. Start the mobile app

```bash
# Start with Expo Go (scan QR code on your device)
yarn mobile

# Open directly in iOS Simulator
yarn ios
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/articles` | List all available articles |
| GET | `/read-later` | List saved read-later items |
| POST | `/read-later` | Add article to read later (`{ articleId }`) |
| DELETE | `/read-later/:articleId` | Remove article from read later |
