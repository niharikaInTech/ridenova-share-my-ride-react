// MapView.jsx
// The Leaflet map. React does not know about Leaflet, so we use "refs" and "useEffect"
// to create the map once, and then update the markers and lines when the props change.

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MAP_CENTER } from "../constants";

// A round or square dot drawn with CSS (no image files needed)
function makePin(cssClass, html) {
  return L.divIcon({
    className: "pin " + cssClass,
    html: html || "",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// Zooms the map so all given points are visible, but not hidden behind the panel
function fitMap(map, latlngs) {
  const isLaptop = window.innerWidth >= 800;
  map.fitBounds(L.latLngBounds(latlngs), {
    paddingTopLeft: [isLaptop ? 440 : 30, 40],                              // panel is on the left on laptops
    paddingBottomRight: [30, isLaptop ? 40 : window.innerHeight * 0.55]     // panel is at the bottom on phones
  });
}

export default function MapView({ pickup, drop, routes, selectedRoute, vehiclePosition, onSelectRoute }) {
  const containerRef = useRef(null);   // the <div> where the map is drawn
  const mapRef = useRef(null);         // the Leaflet map object
  const vehicleMarkerRef = useRef(null);

  // 1. Create the map once, when the component first appears
  useEffect(function () {
    const map = L.map(containerRef.current, { zoomControl: false }).setView(MAP_CENTER, 12);
    L.control.zoom({ position: "topright" }).addTo(map);

    // Free OpenStreetMap tiles (no API key needed).
    // The dark look comes from a CSS filter in styles.css, not from the tiles.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // The function we return runs when the component is removed
    return function () {
      map.remove();
      mapRef.current = null;
      vehicleMarkerRef.current = null;
    };
  }, []);

  // 2. Pickup marker (the function we return removes the old marker before drawing a new one)
  useEffect(function () {
    const map = mapRef.current;
    if (!map || !pickup) {
      return;
    }
    const marker = L.marker([pickup.lat, pickup.lng], { icon: makePin("pickupPin") }).addTo(map);
    return function () {
      marker.remove();
    };
  }, [pickup]);

  // 3. Drop marker
  useEffect(function () {
    const map = mapRef.current;
    if (!map || !drop) {
      return;
    }
    const marker = L.marker([drop.lat, drop.lng], { icon: makePin("dropPin") }).addTo(map);
    return function () {
      marker.remove();
    };
  }, [drop]);

  // 4. Zoom the map when the places change
  useEffect(function () {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    if (pickup && drop) {
      fitMap(map, [[pickup.lat, pickup.lng], [drop.lat, drop.lng]]);
    } else if (pickup || drop) {
      const place = pickup || drop;
      map.setView([place.lat, place.lng], 14);
    } else {
      map.setView(MAP_CENTER, 12);   // back to the start (after "Book another ride")
    }
  }, [pickup, drop]);

  // 5. Zoom to the routes when new routes arrive
  useEffect(function () {
    const map = mapRef.current;
    if (map && routes.length > 0) {
      fitMap(map, routes[0].points);
    }
  }, [routes]);

  // 6. Draw the route lines. The chosen one is thick and gold, the others thin and grey.
  useEffect(function () {
    const map = mapRef.current;
    if (!map || routes.length === 0) {
      return;
    }

    const lines = [];
    let selectedLine = null;

    routes.forEach(function (route) {
      const isSelected = (route === selectedRoute);
      const line = L.polyline(route.points, {
        color: isSelected ? "#d4a94a" : "#8d8d8d",
        weight: isSelected ? 7 : 5,
        opacity: isSelected ? 1 : 0.6
      }).addTo(map);

      // Clicking a line on the map chooses that route
      line.on("click", function () {
        onSelectRoute(route);
      });

      if (isSelected) {
        selectedLine = line;
      }
      lines.push(line);
    });

    if (selectedLine) {
      selectedLine.bringToFront();
    }

    return function () {
      lines.forEach(function (line) {
        line.remove();
      });
    };
  }, [routes, selectedRoute]);

  // 7. Move the vehicle marker along the route
  useEffect(function () {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!vehiclePosition) {
      // No ride going on, so remove the marker if it exists
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.remove();
        vehicleMarkerRef.current = null;
      }
      return;
    }

    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker(vehiclePosition, { icon: makePin("carPin", "🚕") }).addTo(map);
    } else {
      vehicleMarkerRef.current.setLatLng(vehiclePosition);
    }

    // If the vehicle goes outside the visible map, move the map to follow it
    if (!map.getBounds().contains(vehiclePosition)) {
      map.panTo(vehiclePosition);
    }
  }, [vehiclePosition]);

  return <div id="map" ref={containerRef}></div>;
}
