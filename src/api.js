import { TRAFFIC_FACTOR } from "./constants";
import { getDistanceKm } from "./utils";

function shortName(displayName) {
  return displayName.split(",").slice(0, 2).join(",").trim();
}

export async function searchPlaces(query) {
  const url = "https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=in&accept-language=en" +
              "&viewbox=78.2,17.7,78.8,17.1&q=" + encodeURIComponent(query);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Place search failed");
  }
  const data = await response.json();

  return data.map(function (item) {
    return {
      name: shortName(item.display_name),
      fullName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    };
  });
}

export async function reverseGeocode(lat, lng) {
  const url = "https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=" + lat + "&lon=" + lng;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Reverse search failed");
  }
  const data = await response.json();
  return shortName(data.display_name);
}

export async function fetchRoutes(from, to) {
  const url = "https://router.project-osrm.org/route/v1/driving/" +
              from.lng + "," + from.lat + ";" + to.lng + "," + to.lat +
              "?overview=full&geometries=geojson&alternatives=true";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Routing service failed");
  }
  const data = await response.json();
  if (data.code !== "Ok" || data.routes.length === 0) {
    throw new Error("No route found");
  }

  return data.routes.slice(0, 3).map(function (r) {
    return {
      distanceKm: r.distance / 1000,
      minutes: Math.max(1, Math.round((r.duration / 60) * TRAFFIC_FACTOR)),
      points: r.geometry.coordinates.map(function (c) {
        return [c[1], c[0]];
      })
    };
  });
}

export function makeEstimatedRoute(from, to) {
  const distanceKm = getDistanceKm(from, to) * 1.3;
  const minutes = Math.max(1, Math.round((distanceKm / 25) * 60));

  const points = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([from.lat + (to.lat - from.lat) * t, from.lng + (to.lng - from.lng) * t]);
  }
  return { distanceKm, minutes, points };
}
