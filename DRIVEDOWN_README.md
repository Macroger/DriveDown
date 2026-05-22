# DriveDown — Real‑Time Driving Behavior Analysis & Scoring

<div align="center">

**An intelligent mobile application that automatically detects driving trips and scores driver safety based on real-time acceleration and deceleration patterns.**

---

**Framework:** Expo / React Native  
**Platform:** iOS, Android, Web  
**Backend:** Supabase  
**Key Features:** Automatic trip detection, real-time event monitoring, driver safety scoring, offline sync

</div>

---

## What is DriveDown?

DriveDown is a mobile application designed to help drivers understand and improve their driving safety through automatic monitoring. Using GPS location data, the app detects when you're driving, monitors your acceleration and braking patterns, and generates a safety score based on those behaviors.

**Use Cases:**
- Individual drivers seeking to improve their driving habits
- Fleet managers evaluating driver performance and safety
- Insurance programs rewarding safe driving behaviors
- Driver training and coaching programs

---

## How It Works

### The Trip Detection Engine

DriveDown runs continuously in the background, monitoring GPS data in real-time:

1. **GPS Monitoring** — Collects location data at 1-second intervals to build a continuous picture of movement
2. **Speed Analysis** — Filters noisy GPS data by smoothing speed readings to identify actual driving
3. **Automatic Trip Detection** — Recognizes when you start driving (speed > 5 m/s) and stops recording when you stop
4. **Event Detection** — During trips, monitors acceleration and braking patterns, flagging rapid changes (>1.6 m/s² for acceleration, >2.2 m/s² for braking)
5. **Offline Storage** — Stores all trip data locally on your device, then syncs to the server when connectivity is available

### Driver Safety Scoring

The app calculates a 0–100 safety score by analyzing all your trips:
- **Lower scores** indicate more frequent rapid acceleration/braking events
- **Higher scores** indicate smoother, safer driving patterns
- The score updates automatically as new trip data is collected
- Visual progress indicator makes it easy to track improvements over time

---

## Key Features

** Automatic Trip Detection**  
The app runs silently in the background, automatically starting and stopping trip recording without manual intervention.

** Real-Time Monitoring**  
Live display of current speed and driving status. See your acceleration and braking patterns as they happen.

** Safety Scoring**  
Get a clear 0–100 score reflecting your overall driving safety, updated automatically after each trip.

** Offline First**  
All data is stored locally on your device. It syncs to the backend when you're online, so no data is lost.

** Secure & Private**  
Secure authentication and user-scoped data storage ensure only you can see your driving data.

** Dark Mode**  
Full support for light and dark themes, matching your device preferences.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile Framework** | Expo / React Native 0.81 |
| **Language** | TypeScript |
| **State Management** | React Context API + Custom Hooks |
| **Backend** | Supabase (PostgreSQL, Auth, Cloud Functions) |
| **Local Storage** | Expo SQLite |
| **GPS Tracking** | Expo Location API |
| **Navigation** | React Navigation + Expo Router |
| **UI Components** | React Native + Custom Components |

The architecture prioritizes offline-first design — the app continues recording trips even without internet connectivity and automatically syncs data when connectivity is restored.

---

## Architecture Highlights

**Offline-First Data Architecture**  
All trip data is stored locally using SQLite before being synced to the backend. This ensures no data loss due to connectivity issues and allows the app to function even when offline.

**Event-Driven Location Pipeline**  
The GPS location subscription feeds directly into a multi-stage processing pipeline: raw speed → smoothed speed → driving state → event detection → trip management.

**State Management with React Context**  
Trip detection state (driving status, current speed, active trip ID) is managed through a centralized Context Provider, making it accessible throughout the app without prop drilling.

**Cloud-Based Scoring**  
Driver safety scores are calculated server-side using Supabase cloud functions, ensuring consistency and allowing scores to reflect the complete trip history.

---

## Project Status

DriveDown is a **portfolio project** demonstrating full-stack mobile development. While not actively in development, the application is fully functional and serves as a reference implementation for building location-aware, offline-capable mobile applications.

---

## What I Learned

Building DriveDown provided hands-on experience with:

- **Real-time GPS tracking** and location-based event detection
- **Offline-first architecture** patterns and local data persistence
- **React Native + Expo** for cross-platform mobile development
- **Full-stack integration** between React Native frontend and Supabase backend
- **State management** at scale using React Context API and custom hooks
- **Signal processing** for smoothing GPS noise and identifying driving patterns
- **User authentication** and role-based data access control
- **TypeScript** in production applications for type safety and IDE support
- **Responsive UI design** with dark mode support and accessibility considerations

---

## License

Licensed under the MIT License. See [LICENSE](./LICENSE) for details.
