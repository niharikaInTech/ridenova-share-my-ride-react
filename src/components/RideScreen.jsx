import WhatsAppButtons from "./WhatsAppButtons";
import { CAPTAIN } from "../constants";
import { buildRideMessage } from "../messages";
import { calculateFare, getVehicleMinutes, formatRupees } from "../utils";

export default function RideScreen(props) {
  const { stage, otp, route, vehicle, drop, progress, messageInfo, location, sharedContacts } = props;

  const minutes = getVehicleMinutes(route, vehicle);
  const fare = calculateFare(route.distanceKm, minutes, vehicle);
  const minutesLeft = Math.ceil(minutes * (1 - progress / 100));

  let title;
  let status;
  if (stage === "arriving") {
    title = "Captain is arriving";
    status = "Your captain is 3 min away. Tell the OTP to start the trip.";
  } else if (stage === "riding") {
    title = "On your way";
    status = "On the way to " + drop.name + ". About " + minutesLeft + " min left.";
  } else {
    title = "Trip completed";
    status = "You have reached " + drop.name + ".";
  }

  let shareText;
  if (location.shareLocation && location.liveLocation) {
    shareText = "Location sharing is ON (" + location.liveLocation.lat.toFixed(4) + ", " +
                location.liveLocation.lng.toFixed(4) + "). Tap a button to send it on WhatsApp.";
  } else {
    shareText = (location.locationError || "Location sharing is OFF.") + " Only ride details will be sent.";
  }

  return (
    <section>
      <h2>{title}</h2>

      <div className="captain">
        <div className="avatar">RK</div>
        <div className="captainInfo">
          <strong>{CAPTAIN.name} ({CAPTAIN.rating} rating)</strong>
          <p className="hint">{vehicle.name}, {CAPTAIN.plate}</p>
        </div>
        <div className="otp">OTP <strong>{otp}</strong></div>
      </div>

      <p className="status">{status}</p>
      <div className="progressBar">
        <div id="progressFill" style={{ width: progress + "%" }}></div>
      </div>
      <p className="hint">Total fare {formatRupees(fare.total)}. Zero surge.</p>

      <div className="shareBox">
        <h3>Share with your contacts</h3>
        <p className="hint">{shareText}</p>
        <WhatsAppButtons
          contacts={sharedContacts}
          getMessage={function () { return buildRideMessage(messageInfo); }}
          label="Send ride details to"
        />
        {location.shareLocation && (
          <button type="button" className="linkBtn" onClick={location.stopSharing}>
            Stop sharing my location
          </button>
        )}
      </div>

      <a className="callBtn" href="tel:112">SOS: call 112</a>

      {stage === "completed" && (
        <button type="button" className="primary" onClick={props.onNewRide}>Book another ride</button>
      )}
    </section>
  );
}
