// constants.js
// Fixed settings and sample data. To change a fare rate or the captain, edit only this file.

// Hyderabad city centre. The map starts here.
export const MAP_CENTER = [17.385, 78.4867];

// The routing service gives travel time without traffic.
// We add 25% extra so the time looks more realistic for city roads.
export const TRAFFIC_FACTOR = 1.25;

// The ride types. Fare = base + (perKm x km) + (perMin x minutes) + surge
// timeFactor: a bike is a bit faster than the cab time, an auto a bit slower.
export const VEHICLES = [
  { id: "bike",  name: "RideNova Bike",  emoji: "🏍️", seats: 1, base: 20, perKm: 6,  perMin: 0.8, timeFactor: 0.85, note: "Beat the traffic" },
  { id: "auto",  name: "RideNova Auto",  emoji: "🛺", seats: 3, base: 25, perKm: 9,  perMin: 1,   timeFactor: 1.1,  note: "Metered-fair, no haggling" },
  { id: "go",    name: "RideNova Go",    emoji: "🚕", seats: 4, base: 40, perKm: 12, perMin: 1.5, timeFactor: 1,    note: "Everyday cab" },
  { id: "prime", name: "RideNova Prime", emoji: "🚘", seats: 4, base: 60, perKm: 15, perMin: 2,   timeFactor: 1,    note: "Newer cars, top-rated captains" },
  { id: "xl",    name: "RideNova XL",    emoji: "🚐", seats: 6, base: 80, perKm: 19, perMin: 2.5, timeFactor: 1.05, note: "Groups and luggage" }
];

// A fake captain for the demo
export const CAPTAIN = {
  name: "Ravi K.",
  rating: "4.8",
  plate: "TS 09 AB 1234"
};

export const MAX_CONTACTS = 3;          // rider can add up to 3 trusted contacts
export const NIGHT_START_HOUR = 21;     // night starts at 9 PM
export const NIGHT_END_HOUR = 5;        // night ends at 5 AM
export const DEMO_RIDE_SECONDS = 30;    // the demo ride finishes in 30 seconds
export const TICK_MS = 200;             // the vehicle moves every 0.2 second
export const CHECKIN_WAIT_SECONDS = 15; // wait 15 seconds for the rider's reply
