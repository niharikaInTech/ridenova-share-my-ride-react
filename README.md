# RideNova - Share My Ride (React)

A booking feature for the RideNova shortlisting task.

**What I built:** A real-map booking flow. The rider searches pickup and drop-off, sees up to 3 real road routes on a map, picks one, and compares RideNova Bike, Auto, Go, Prime and XL with a full fare breakdown (base + distance + time + zero surge). Before the ride starts, the app asks permission to share location. Trusted contacts then get the ride details and a live-location link on WhatsApp. After night rides the rider gets a "Did you reach safely?" check-in, with an alert option if they say no or do not reply.

## Why this feature
RideNova promises transparent pricing and safety, but SOS and trip sharing only help during the ride. This adds route choice with clear costs, consent-based location sharing with trusted contacts, and a check-in after the ride.

## Tech stack
| Part | Used for |
|---|---|
| **React 18** (function components + hooks) | The user interface |
| **Vite** | Runs and builds the project |
| **Leaflet** | The map, markers and route lines |
| **OpenStreetMap tiles** | The map background (darkened with a CSS filter) |
| **Nominatim** (OpenStreetMap) | Searching places, and the address for "Use my current location" |
| **OSRM** | Real road routes, distance and time |
| **Geolocation API** (browser) | Asking permission and reading GPS |
| **WhatsApp click-to-chat links** (`wa.me`) | Opening WhatsApp with the message ready |
| `localStorage` | Remembering trusted contacts |

Everything is free and needs no API key. Internet is needed.

## How to run
You need **Node.js 18 or newer** (check with `node -v`).

```
npm install
npm run dev
```
Open the link shown in the terminal (usually http://localhost:5173).

To deploy: run `npm run build`, then drag the new `dist` folder onto **netlify.com/drop**. Or push the project to GitHub and import it in Netlify or Vercel. Do not upload `node_modules`.

## Demo flow
1. Type "Hitech City" in Drop-off, press **Search**, tap a result.
2. For pickup tap **Use my current location** (allow it), or search e.g. "LB Nagar".
3. Tap **See routes and fares**. Switch routes (chips or the lines on the map) and watch the fares change.
4. Tap different ride types and read the fare breakdown.
5. Add a trusted contact (name + 10-digit mobile).
6. Tick **Pretend this is a night ride**, then tap **Book**.
7. A pop-up asks about sharing location. Tap **Yes** and allow it in the browser box.
8. Watch the captain, OTP and the vehicle moving along the route (about 30 seconds).
9. Tap **Send ride details to ... on WhatsApp**. WhatsApp opens with the message and your location link ready.
10. At the check-in tap **Yes**, or **No** / wait 15 seconds for the alert and the 112 button.

## Folder structure
```
index.html                      page where React is placed
src/main.jsx                    starting point
src/App.jsx                     main component: state, timers, which screen to show
src/constants.js                settings, ride types, fare rates, captain
src/utils.js                    pure helper functions (fare, distance, validation, links, route names)
src/api.js                      talks to Nominatim and OSRM
src/messages.js                 builds the WhatsApp message texts
src/hooks/useContacts.js        custom hook: trusted contacts + localStorage
src/hooks/useLocationSharing.js custom hook: permission + live GPS
src/components/MapView.jsx      the Leaflet map
src/components/SearchScreen.jsx screen 1 (uses PlaceField twice)
src/components/PlaceField.jsx   one place search box (reused for pickup and drop)
src/components/OptionsScreen.jsx screen 2 (uses RouteList, VehicleList, FareBreakdown, ContactsBox)
src/components/RideScreen.jsx   captain, OTP, progress, share buttons
src/components/CheckinScreen.jsx night safety check-in
src/components/WhatsAppButtons.jsx one button per contact
src/components/ConsentModal.jsx the location permission pop-up
src/styles.css                  all styling, mobile-first
```

## React ideas used (good for the interview)
- **Components and props:** the screen is split into small components. Data goes down as props (for example `PlaceField` gets `label`, `place`, `onChoose`).
- **State (`useState`):** data that changes the screen, like the chosen route or the current stage. We never edit state directly. We always create a new array or object (`[...contacts, newContact]`).
- **Lifting state up:** `App.jsx` owns the shared state (pickup, drop, routes, stage) because many components need it.
- **`useEffect`:** used for timers and for the map. Each effect returns a cleanup function that removes the timer or marker, so nothing is left behind.
- **`useRef`:** keeps the Leaflet map object and the GPS watcher id between renders without causing a re-render.
- **Custom hooks:** `useContacts` and `useLocationSharing` keep logic out of the components.
- **Controlled inputs:** every text box shows a state value and updates it in `onChange`.
- **Conditional rendering:** `{stage === "search" && <SearchScreen />}` shows one screen at a time.
- **Lists with `key`:** `routes.map(...)` and `contacts.map(...)` give each item a unique key.

## How the logic works

**Stages (App.jsx).** The app moves through `search -> options -> finding -> arriving -> riding -> checkin or completed`. Timer effects watch the stage: after 2.5 s of "finding" the captain arrives, after 3 s the trip starts, then `progress` grows every 0.2 s until it reaches 100.

**Places (api.js, PlaceField.jsx).** Text goes to Nominatim, which returns places with latitude and longitude. The search runs on the Search button or Enter (not on every key press) to respect its usage policy.

**Real routes (api.js, utils.js).** The two places go to OSRM, which returns up to 3 routes with distance, time and a list of GPS points. OSRM sends points as [longitude, latitude], so we swap them for Leaflet. OSRM times ignore traffic, so we multiply by 1.25. `labelRoutes` sorts by time: quickest is "Fastest", least distance is "Shortest", the rest are "Alternative". If OSRM is down, a straight-line estimated route is used and a notice is shown.

**Fare (utils.js, calculateFare).** `fare = base + (perKm x distance) + (perMin x time) + surge`. Each part is rounded first so the breakdown always adds up. Surge is always 0. Changing the route or ride type recalculates everything.

**Location permission (App.jsx, useLocationSharing.js).** The pop-up appears only if at least one contact is ticked. On Yes, `navigator.geolocation.getCurrentPosition` makes the browser show its own permission box. If allowed, `watchPosition` keeps updating the position. If the rider says No or blocks it, the app continues and messages contain ride details but no location. The ride screen shows whether sharing is ON or OFF, and has a "Stop sharing" button.

**WhatsApp (WhatsAppButtons.jsx, messages.js).** A button opens `https://wa.me/91<number>?text=<message>`. The message includes a Google Maps link made from the latest GPS position. The message is built at the moment of the click, so it has the newest location.

**Vehicle on the map (App.jsx, MapView.jsx).** `index = progress / 100 x (points.length - 1)` picks a point on the route. `MapView` moves the marker to it.

**Night check-in (CheckinScreen.jsx).** The ride is a night ride if the toggle is ticked or the real clock is between 9 PM and 5 AM. A 15 second countdown runs. Yes shows buttons to tell the contacts. No, or the countdown reaching 0, shows buttons to alert the contacts and a call-112 button.

## What is real and what is simulated
**Real:** the map, place search, road routes, distance and time, browser GPS permission and location, WhatsApp chat links with the location link.

**Simulated:**
- Fares are sample numbers (RideNova has not launched). There is no real booking or payment.
- The captain, OTP and the 3-second arrival are fake. The vehicle moves along the real route in 30 seconds for the demo.
- **WhatsApp messages are not sent automatically.** A website cannot send WhatsApp messages on its own. The button opens WhatsApp with the message ready, and the rider presses send. Automatic sending needs a backend and the WhatsApp Business API (for example Twilio or Meta Cloud API).
- A WhatsApp link shows the location at the moment of sending. Continuous live tracking for contacts would also need a backend (for example WebSockets).
- The check-in prompt is shown in the app. A real version would push it as a notification.

## Notes
- Nominatim, OSRM and OpenStreetMap tiles are free public services for light use. If one is slow, wait a moment and try again.
- Location works only on `localhost` or `https`.
- In development, React StrictMode runs effects twice on purpose, so you may see the map set up twice. This does not happen in the built version.

## Possible improvements
- Node.js backend with the WhatsApp Business API for automatic messages
- WebSockets so contacts can open a live tracking page
- Real driver matching and payments
