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
  const [stage, setStage] = useState("search");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[2]);
  const [usedBackupRoute, setUsedBackupRoute] = useState(false);
  const [riderName, setRiderName] = useState("Priya");
  const [nightToggle, setNightToggle] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [progress, setProgress] = useState(0);

  const contactsApi = useContacts();
  const location = useLocationSharing();
  const sharedContacts = contactsApi.contacts.filter(function (c) { return c.shared; });

  useEffect(function () {
    if (stage !== "finding") {
      return;
    }
    const id = setTimeout(function () { setStage("arriving"); }, 2500);
    return function () { clearTimeout(id); };
  }, [stage]);

  useEffect(function () {
    if (stage !== "arriving") {
      return;
    }
    const id = setTimeout(function () { setStage("riding"); }, 3000);
    return function () { clearTimeout(id); };
  }, [stage]);

  useEffect(function () {
    if (stage !== "riding") {
      return;
    }
    const totalTicks = (DEMO_RIDE_SECONDS * 1000) / TICK_MS;
    const id = setInterval(function () {
      setProgress(function (old) {
        const next = old + 100 / totalTicks;
        return next > 99.999 ? 100 : next;
      });
    }, TICK_MS);
    return function () { clearInterval(id); };
  }, [stage]);

  useEffect(function () {
    if (stage !== "riding" || progress < 100) {
      return;
    }
    location.stopWatching();
    const isNight = nightToggle || isNightTime(new Date());
    setStage(isNight ? "checkin" : "completed");
  }, [stage, progress]);

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
    setSelectedRoute(labelled[0]);
    setUsedBackupRoute(usedBackup);
    setStage("options");
  }

  function handleBack() {
    setRoutes([]);
    setSelectedRoute(null);
    setStage("search");
  }

  function handleBook() {
    if (sharedContacts.length > 0) {
      setShowConsent(true);
    } else {
      startBooking();
    }
  }

  function handleConsent(allow) {
    setShowConsent(false);
    if (allow) {
      location.requestLocationSharing(startBooking);
    } else {
      location.declineSharing();
      startBooking();
    }
  }

  function startBooking() {
    setProgress(0);
    setOtp(String(1000 + Math.floor(Math.random() * 9000)));
    setStage("finding");
  }

  function resetApp() {
    location.resetLocation();
    setPickup(null);
    setDrop(null);
    setRoutes([]);
    setSelectedRoute(null);
    setProgress(0);
    setStage("search");
  }

  let vehiclePosition = null;
  const onRide = ["arriving", "riding", "checkin", "completed"].includes(stage);
  if (onRide && selectedRoute) {
    const points = selectedRoute.points;
    vehiclePosition = points[Math.floor((progress / 100) * (points.length - 1))];
  }

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
