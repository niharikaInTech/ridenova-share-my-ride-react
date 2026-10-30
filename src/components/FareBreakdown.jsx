import { calculateFare, getVehicleMinutes, formatRupees } from "../utils";

function FareLine({ label, amount, isTotal }) {
  return (
    <div className={isTotal ? "fareLine total" : "fareLine"}>
      <span>{label}</span>
      <span>{formatRupees(amount)}</span>
    </div>
  );
}

export default function FareBreakdown({ route, vehicle }) {
  const minutes = getVehicleMinutes(route, vehicle);
  const fare = calculateFare(route.distanceKm, minutes, vehicle);

  return (
    <div className="fareBox">
      <h3>Fare breakdown</h3>
      <FareLine label="Base fare" amount={fare.base} />
      <FareLine label={"Distance (" + route.distanceKm.toFixed(1) + " km x ₹" + vehicle.perKm + ")"} amount={fare.distancePart} />
      <FareLine label={"Time (" + minutes + " min x ₹" + vehicle.perMin + ")"} amount={fare.timePart} />
      <FareLine label="Demand surge (always zero)" amount={fare.surge} />
      <FareLine label="Total" amount={fare.total} isTotal={true} />
      <p className="hint">Sample fare. You see the full price before you confirm.</p>
    </div>
  );
}
