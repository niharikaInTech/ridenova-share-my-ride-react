export const MAP_CENTER = [17.385, 78.4867];

export const TRAFFIC_FACTOR = 1.25;

export const VEHICLES = [
  { id: "bike",  name: "RideNova Bike",  emoji: "🏍️", seats: 1, base: 20, perKm: 6,  perMin: 0.8, timeFactor: 0.85, note: "Beat the traffic" },
  { id: "auto",  name: "RideNova Auto",  emoji: "🛺", seats: 3, base: 25, perKm: 9,  perMin: 1,   timeFactor: 1.1,  note: "Metered-fair, no haggling" },
  { id: "go",    name: "RideNova Go",    emoji: "🚕", seats: 4, base: 40, perKm: 12, perMin: 1.5, timeFactor: 1,    note: "Everyday cab" },
  { id: "prime", name: "RideNova Prime", emoji: "🚘", seats: 4, base: 60, perKm: 15, perMin: 2,   timeFactor: 1,    note: "Newer cars, top-rated captains" },
  { id: "xl",    name: "RideNova XL",    emoji: "🚐", seats: 6, base: 80, perKm: 19, perMin: 2.5, timeFactor: 1.05, note: "Groups and luggage" }
];

export const CAPTAIN = {
  name: "Ravi K.",
  rating: "4.8",
  plate: "TS 09 AB 1234"
};

export const MAX_CONTACTS = 3;
export const NIGHT_START_HOUR = 21;
export const NIGHT_END_HOUR = 5;
export const DEMO_RIDE_SECONDS = 30;
export const TICK_MS = 200;
export const CHECKIN_WAIT_SECONDS = 15;
