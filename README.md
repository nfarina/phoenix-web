# Phoenix Workout Tracker

A client-side web application for tracking your workouts with customizable exercises, rest timers, and workout logging.

## Features

- Track exercise sets, weights, and reps
- Built-in rest timer between sets with audio notification
- Note-taking for each exercise
- Export workout data to clipboard
- Dark mode support
- Responsive UI for mobile and desktop
- Data persistence using localStorage

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- Yarn or npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/phoenix-web.git
cd phoenix-web
```

2. Install dependencies

```bash
yarn install
```

3. Development

```bash
yarn dev
```

4. Build for production

```bash
yarn build
```

5. Preview production build

```bash
yarn preview
```

## Deployment to Firebase

1. Install Firebase CLI if you haven't already

```bash
npm install -g firebase-tools
```

2. Login to Firebase

```bash
firebase login
```

3. Initialize Firebase (if first time)

```bash
firebase init
```

4. Deploy to Firebase

```bash
yarn deploy
```

Or manually:

```bash
yarn build
firebase deploy
```

## Tech Stack

- React
- Vite
- Tailwind CSS
- Firebase Hosting
