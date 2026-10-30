// useLocationSharing.js
// A custom hook for live location sharing. The browser always asks the user for permission first.

import { useState, useRef } from "react";

export default function useLocationSharing() {
  const [shareLocation, setShareLocation] = useState(false);  // did the rider allow sharing?
  const [liveLocation, setLiveLocation] = useState(null);     // { lat, lng } from the phone's GPS
  const [locationError, setLocationError] = useState("");

  // A ref keeps a value between renders without causing a re-render.
  // We use it for the id of the GPS watcher, so we can stop it later.
  const watchIdRef = useRef(null);

  function savePosition(position) {
    setLiveLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
  }

  // Asks the browser for permission and starts watching the position.
  // "onDone" is called after the user has answered (allowed or blocked).
  function requestLocationSharing(onDone) {
    if (!navigator.geolocation) {
      setShareLocation(false);
      setLocationError("This browser cannot share location.");
      onDone();
      return;
    }

    navigator.geolocation.getCurrentPosition(function (position) {
      // User allowed. Save the position and keep watching it as the user moves.
      setShareLocation(true);
      setLocationError("");
      savePosition(position);
      watchIdRef.current = navigator.geolocation.watchPosition(savePosition, function () {}, { enableHighAccuracy: true });
      onDone();
    }, function () {
      // User blocked it, or it failed
      setShareLocation(false);
      setLocationError("Location permission was not given, so your location is not shared.");
      onDone();
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  // The rider chose "No" in our pop-up
  function declineSharing() {
    setShareLocation(false);
    setLocationError("You chose not to share your location.");
  }

  // Stops watching the GPS (the last known position is kept for the final messages)
  function stopWatching() {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
  }

  // "Stop sharing my location" button
  function stopSharing() {
    stopWatching();
    setShareLocation(false);
    setLocationError("You stopped sharing your location.");
  }

  // Used when the rider books another ride
  function resetLocation() {
    stopWatching();
    setShareLocation(false);
    setLiveLocation(null);
    setLocationError("");
  }

  return {
    shareLocation, liveLocation, locationError,
    requestLocationSharing, declineSharing, stopWatching, stopSharing, resetLocation
  };
}
