// utils.js
// Small reusable functions. They do not use React or the map, so they are easy to test.

import { NIGHT_START_HOUR, NIGHT_END_HOUR } from "./constants";

export function formatRupees(amount) {
  return "₹" + Math.round(amount);
}

export function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Night = 9 PM or later, OR before 5 AM
export function isNightTime(date) {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

// Indian mobile numbers have 10 digits and start with 6, 7, 8 or 9
export function isValidPhone(phone) {
  return /^[6-9][0-9]{9}$/.test(phone);
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Haversine formula: straight-line distance in km between two points,
// when we know their latitude and longitude. Used only if the routing service is down.
export function getDistanceKm(placeA, placeB) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(placeB.lat - placeA.lat);
  const dLng = toRadians(placeB.lng - placeA.lng);

  const a = Math.pow(Math.sin(dLat / 2), 2) +
            Math.cos(toRadians(placeA.lat)) *
            Math.cos(toRadians(placeB.lat)) *
            Math.pow(Math.sin(dLng / 2), 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

// Trip time for a ride type (a bike is faster than a cab, and so on)
export function getVehicleMinutes(route, vehicle) {
  return Math.max(1, Math.round(route.minutes * vehicle.timeFactor));
}

// Returns each part of the fare separately so we can show a breakdown.
// Every part is rounded first, so the parts always add up to the total.
export function calculateFare(distanceKm, minutes, vehicle) {
  const base = vehicle.base;
  const distancePart = Math.round(distanceKm * vehicle.perKm);
  const timePart = Math.round(minutes * vehicle.perMin);
  const surge = 0;   // RideNova promises zero surge
  const total = base + distancePart + timePart + surge;

  return { base, distancePart, timePart, surge, total };
}

// A Google Maps link that opens the given location
export function buildMapsLink(lat, lng) {
  return "https://www.google.com/maps?q=" + lat + "," + lng;
}

// A WhatsApp link that opens a chat with the number and a ready-typed message.
// 91 is India's country code.
export function buildWhatsAppLink(phone, text) {
  return "https://wa.me/91" + phone + "?text=" + encodeURIComponent(text);
}

// Sorts routes by time and names them.
// The quickest is "Fastest". The one with least distance is "Shortest". Others are "Alternative".
export function labelRoutes(routes) {
  const sorted = [...routes].sort(function (a, b) {
    return a.minutes - b.minutes;
  });

  // find the route with the smallest distance
  let shortestIndex = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].distanceKm < sorted[shortestIndex].distanceKm) {
      shortestIndex = i;
    }
  }

  let alternativeCount = 0;
  return sorted.map(function (route, i) {
    let name;
    if (i === 0) {
      name = "Fastest";
    } else if (i === shortestIndex) {
      name = "Shortest";
    } else {
      alternativeCount++;
      name = alternativeCount === 1 ? "Alternative" : "Alternative " + alternativeCount;
    }
    return { ...route, name: name };   // copy of the route with a name added
  });
}
