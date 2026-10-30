import { useEffect, useRef } from "react";
import L from "leaflet";
import { MAP_CENTER } from "../constants";

function makePin(cssClass, html) {
  return L.divIcon({
    className: "pin " + cssClass,
    html: html || "",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function fitMap(map, latlngs) {
  const isLaptop = window.innerWidth >= 800;
  map.fitBounds(L.latLngBounds(latlngs), {
    paddingTopLeft: [isLaptop ? 440 : 30, 40],
    paddingBottomRight: [30, isLaptop ? 40 : window.innerHeight * 0.55]
  });
}

export default function MapView({ pickup, drop, routes, selectedRoute, vehiclePosition, onSelectRoute }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const vehicleMarkerRef = useRef(null);

  useEffect(function () {
    const map = L.map(containerRef.current, { zoomControl: false }).setView(MAP_CENTER, 12);
    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return function () {
      map.remove();
      mapRef.current = null;
      vehicleMarkerRef.current = null;
    };
  }, []);

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
      map.setView(MAP_CENTER, 12);
    }
  }, [pickup, drop]);

  useEffect(function () {
    const map = mapRef.current;
    if (map && routes.length > 0) {
      fitMap(map, routes[0].points);
    }
  }, [routes]);

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

  useEffect(function () {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!vehiclePosition) {
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

    if (!map.getBounds().contains(vehiclePosition)) {
      map.panTo(vehiclePosition);
    }
  }, [vehiclePosition]);

  return <div id="map" ref={containerRef}></div>;
}
