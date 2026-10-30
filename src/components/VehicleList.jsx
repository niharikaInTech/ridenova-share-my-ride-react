import { VEHICLES } from "../constants";
import { calculateFare, getVehicleMinutes, formatRupees, formatTime } from "../utils";

export default function VehicleList({ route, selectedVehicle, onSelect }) {
  return (
    <div>
      {VEHICLES.map(function (vehicle) {
        const minutes = getVehicleMinutes(route, vehicle);
        const fare = calculateFare(route.distanceKm, minutes, vehicle);
        const dropTime = formatTime(new Date(Date.now() + minutes * 60000));
        const className = vehicle === selectedVehicle ? "vehicleRow selected" : "vehicleRow";

        return (
          <button type="button" className={className} key={vehicle.id} onClick={function () { onSelect(vehicle); }}>
            <span className="vehicleIcon">{vehicle.emoji}</span>
            <span className="vehicleInfo">
              <strong>{vehicle.name}</strong>
              <span className="hint">{vehicle.seats} {vehicle.seats === 1 ? "seat" : "seats"}, {vehicle.note}</span>
              <span className="hint">Drop-off {dropTime} ({minutes} min)</span>
            </span>
            <strong className="vehiclePrice">{formatRupees(fare.total)}</strong>
          </button>
        );
      })}
    </div>
  );
}
