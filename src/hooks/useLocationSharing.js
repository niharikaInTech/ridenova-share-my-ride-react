import { useState, useRef } from "react";

export default function useLocationSharing() {
  const [shareLocation, setShareLocation] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const watchIdRef = useRef(null);

  function savePosition(position) {
    setLiveLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
  }

  function requestLocationSharing(onDone) {
    if (!navigator.geolocation) {
      setShareLocation(false);
      setLocationError("This browser cannot share location.");
      onDone();
      return;
    }

    navigator.geolocation.getCurrentPosition(function (position) {
      setShareLocation(true);
      setLocationError("");
      savePosition(position);
      watchIdRef.current = navigator.geolocation.watchPosition(savePosition, function () {}, { enableHighAccuracy: true });
      onDone();
    }, function () {
      setShareLocation(false);
      setLocationError("Location permission was not given, so your location is not shared.");
      onDone();
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  function declineSharing() {
    setShareLocation(false);
    setLocationError("You chose not to share your location.");
  }

  function stopWatching() {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
  }

  function stopSharing() {
    stopWatching();
    setShareLocation(false);
    setLocationError("You stopped sharing your location.");
  }

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
