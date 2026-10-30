import { NIGHT_START_HOUR, NIGHT_END_HOUR } from "./constants";

export function formatRupees(amount) {
  return "₹" + Math.round(amount);
}

export function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function isNightTime(date) {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export function isValidPhone(phone) {
  return /^[6-9][0-9]{9}$/.test(phone);
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

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

export function getVehicleMinutes(route, vehicle) {
  return Math.max(1, Math.round(route.minutes * vehicle.timeFactor));
}

export function calculateFare(distanceKm, minutes, vehicle) {
  const base = vehicle.base;
  const distancePart = Math.round(distanceKm * vehicle.perKm);
  const timePart = Math.round(minutes * vehicle.perMin);
  const surge = 0;
  const total = base + distancePart + timePart + surge;

  return { base, distancePart, timePart, surge, total };
}

export function buildMapsLink(lat, lng) {
  return "https://www.google.com/maps?q=" + lat + "," + lng;
}

export function buildWhatsAppLink(phone, text) {
  return "https://wa.me/91" + phone + "?text=" + encodeURIComponent(text);
}

export function labelRoutes(routes) {
  const sorted = [...routes].sort(function (a, b) {
    return a.minutes - b.minutes;
  });

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
    return { ...route, name: name };
  });
}
