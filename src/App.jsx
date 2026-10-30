// App.jsx
// The main component. It keeps the important data (state) and decides which screen to show.
// The "stage" tells where the rider is in the booking:
//   search -> options -> finding -> arriving -> riding -> checkin (night) or completed (day)

import { useState, useEffect } from "react";

import MapView from "./components/MapView";
import SearchScreen from "./components/SearchScreen";
import OptionsScreen from "./components/OptionsScreen";
import RideScreen from "./components/RideScreen";
import CheckinScreen from "./components/CheckinScreen";
import ConsentModal from "./components/ConsentModal";

import useContacts from "./hooks/useContacts";
import useLocationSharing from "./hooks/useLocationSharing";
import { fetchRoutes, makeEstimatedRoute } from "./api";
import { labelRoutes, isNightTime } from "./utils";
import { VEHICLES, DEMO_RIDE_SECONDS, TICK_MS } from "./constants";

export default function App() {
  // ----- state: data that changes while the app is used -----
  const [stage, setStage] = useState("search");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[2]);   // start with RideNova Go
  const [usedBackupRoute, setUsedBackupRoute] = useState(false);
  const [riderName, setRiderName] = useState("Priya");
  const [nightToggle, setNightToggle] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [progress, setProgress] = useState(0);   // 0 to 100 (percentage of the ride completed)

  // ----- custom hooks: they hold the contacts and the location logic -----
  const contactsApi = useContacts();
  const location = useLocationSharing();
  const sharedContacts = contactsApi.contacts.filter(function (c) { return c.shared; });

  // ----- timers: each one starts when the stage changes and is cleaned up when it changes again -----

  // After 2.5 seconds of "finding a captain", the captain arrives
  useEffect(function () {
    if (stage !== "finding") {
      return;
    }
    const id = setTimeout(function () { setStage("arriving"); }, 2500);
    return function () { clearTimeout(id); };
  }, [stage]);

  // After 3 seconds, the trip starts
  useEffect(function () {
    if (stage !== "arriving") {
      return;
    }
    const id = setTimeout(function () { setStage("riding"); }, 3000);
    return function () { clearTimeout(id); };
  }, [stage]);

  // While riding, move forward a little every TICK_MS milliseconds
  useEffect(function () {
    if (stage !== "riding") {
      return;
    }
    const totalTicks = (DEMO_RIDE_SECONDS * 1000) / TICK_MS;   // 30 s / 0.2 s = 150 ticks
    const id = setInterval(function () {
      setProgress(function (old) {
        const next = old + 100 / totalTicks;
        return next > 99.999 ? 100 : next;   // avoids tiny decimal errors
      });
    }, TICK_MS);
    return function () { clearInterval(id); };
  }, [stage]);

  // When progress reaches 100, the ride ends. Night rides get a safety check-in.
  useEffect(function () {
    if (stage !== "riding" || progress < 100) {
      return;
    }
    location.stopWatching();   // no more live updates after the trip ends
    const isNight = nightToggle || isNightTime(new Date());
    setStage(isNight ? "checkin" : "completed");
  }, [stage, progress]);

  // ----- actions -----

  // "See routes and fares": get real routes (or an estimated one if the service is down)
  async function handleSeeRoutes() {
    let found;
    let usedBackup = false;
    try {
      found = await fetchRoutes(pickup, drop);
    } catch (error) {
      found = [makeEstimatedRoute(pickup, drop)];
      usedBackup = true;
    }

    const labelled = labelRoutes(found);
    setRoutes(labelled);
    setSelectedRoute(labelled[0]);   // start with the fastest
    setUsedBackupRoute(usedBackup);
    setStage("options");
  }

  function handleBack() {
    setRoutes([]);
    setSelectedRoute(null);
    setStage("search");
  }

  // "Book": ask about location only if there is someone to share it with
  function handleBook() {
    if (sharedContacts.length > 0) {
      setShowConsent(true);
    } else {
      startBooking();
    }
  }

  // The rider answered the location pop-up
  function handleConsent(allow) {
    setShowConsent(false);
    if (allow) {
      location.requestLocationSharing(startBooking);   // startBooking runs after the browser's permission box is answered
    } else {
      location.declineSharing();
      startBooking();
    }
  }

  function startBooking() {
    setProgress(0);
    setOtp(String(1000 + Math.floor(Math.random() * 9000)));   // random 4-digit OTP
    setStage("finding");
  }

  // "Book another ride": put everything back to the start
  function resetApp() {
    location.resetLocation();
    setPickup(null);
    setDrop(null);
    setRoutes([]);
    setSelectedRoute(null);
    setProgress(0);
    setStage("search");
  }

  // ----- values we pass down to other components -----

  // The vehicle's position on the map: a point on the route, based on the progress
  let vehiclePosition = null;
  const onRide = ["arriving", "riding", "checkin", "completed"].includes(stage);
  if (onRide && selectedRoute) {
    const points = selectedRoute.points;
    vehiclePosition = points[Math.floor((progress / 100) * (points.length - 1))];
  }

  // Everything the WhatsApp messages need
  const messageInfo = {
    riderName: riderName.trim() === "" ? "Rider" : riderName.trim(),
    pickup: pickup,
    drop: drop,
    vehicle: selectedVehicle,
    shareLocation: location.shareLocation,
    liveLocation: location.liveLocation
  };

  return (
    <>
      <MapView
        pickup={pickup}
        drop={drop}
        routes={routes}
        selectedRoute={selectedRoute}
        vehiclePosition={vehiclePosition}
        onSelectRoute={setSelectedRoute}
      />

      <aside className="sheet">
        <header className="brand">
          <strong>RideNova</strong>
          <span>Demo with sample fares. RideNova has not launched yet.</span>
        </header>

        {stage === "search" && (
          <SearchScreen
            pickup={pickup}
            drop={drop}
            setPickup={setPickup}
            setDrop={setDrop}
            onSeeRoutes={handleSeeRoutes}
          />
        )}

        {stage === "options" && selectedRoute && (
          <OptionsScreen
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            usedBackupRoute={usedBackupRoute}
            contactsApi={contactsApi}
            riderName={riderName}
            onRiderNameChange={setRiderName}
            nightToggle={nightToggle}
            onNightToggleChange={setNightToggle}
            onBook={handleBook}
            onBack={handleBack}
          />
        )}

        {stage === "finding" && (
          <section>
            <h2>Finding your captain</h2>
            <p className="hint">Looking for the nearest verified captain...</p>
            <div className="pulse"></div>
          </section>
        )}

        {(stage === "arriving" || stage === "riding" || stage === "completed") && (
          <RideScreen
            stage={stage}
            otp={otp}
            route={selectedRoute}
            vehicle={selectedVehicle}
            drop={drop}
            progress={progress}
            messageInfo={messageInfo}
            location={location}
            sharedContacts={sharedContacts}
            onNewRide={resetApp}
          />
        )}

        {stage === "checkin" && (
          <CheckinScreen
            riderName={messageInfo.riderName}
            drop={drop}
            sharedContacts={sharedContacts}
            messageInfo={messageInfo}
            onNewRide={resetApp}
          />
        )}
      </aside>

      {showConsent && (
        <ConsentModal
          onYes={function () { handleConsent(true); }}
          onNo={function () { handleConsent(false); }}
        />
      )}
    </>
  );
}
