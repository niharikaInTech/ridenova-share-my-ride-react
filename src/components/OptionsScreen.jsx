import RouteList from "./RouteList";
import VehicleList from "./VehicleList";
import FareBreakdown from "./FareBreakdown";
import ContactsBox from "./ContactsBox";
import { calculateFare, getVehicleMinutes, formatRupees } from "../utils";

export default function OptionsScreen(props) {
  const { routes, selectedRoute, selectedVehicle, usedBackupRoute, nightToggle } = props;

  const fare = calculateFare(selectedRoute.distanceKm, getVehicleMinutes(selectedRoute, selectedVehicle), selectedVehicle);

  return (
    <section>
      <button type="button" className="linkBtn" onClick={props.onBack}>Back</button>
      <h2>Choose route and ride</h2>

      {usedBackupRoute && (
        <p className="notice">Live routing is not available right now. This is an estimated straight-line route.</p>
      )}

      <h3>Route</h3>
      <RouteList routes={routes} selectedRoute={selectedRoute} onSelect={props.onSelectRoute} />
      <p className="hint">Tap a route here or on the map. Times include extra for city traffic.</p>

      <h3>Ride</h3>
      <VehicleList route={selectedRoute} selectedVehicle={selectedVehicle} onSelect={props.onSelectVehicle} />
      <FareBreakdown route={selectedRoute} vehicle={selectedVehicle} />

      <ContactsBox
        contactsApi={props.contactsApi}
        riderName={props.riderName}
        onRiderNameChange={props.onRiderNameChange}
      />

      <label className="checkRow">
        <input
          type="checkbox"
          checked={nightToggle}
          onChange={function (event) { props.onNightToggleChange(event.target.checked); }}
        />
        Pretend this is a night ride (after 9 PM)
      </label>

      <button type="button" className="primary" onClick={props.onBook}>
        Book {selectedVehicle.name} for {formatRupees(fare.total)}
      </button>
    </section>
  );
}
