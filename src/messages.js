// messages.js
// Builds the WhatsApp message texts.
// "info" is an object: { riderName, pickup, drop, vehicle, shareLocation, liveLocation }

import { CAPTAIN } from "./constants";
import { buildMapsLink } from "./utils";

// Adds the location link only if the rider allowed sharing
function getLocationText(info) {
  if (info.shareLocation && info.liveLocation) {
    return " My live location: " + buildMapsLink(info.liveLocation.lat, info.liveLocation.lng);
  }
  return "";
}

export function buildRideMessage(info) {
  return info.riderName + " is on a RideNova ride from " + info.pickup.name + " to " + info.drop.name +
         ". Captain: " + CAPTAIN.name + ", " + info.vehicle.name + " (" + CAPTAIN.plate + ")." +
         getLocationText(info);
}

export function buildSafeMessage(info) {
  return info.riderName + " has reached " + info.drop.name + " safely." + getLocationText(info);
}

export function buildAlertMessage(info, reason) {
  return "ALERT: " + info.riderName + " " + reason + " after the RideNova ride to " + info.drop.name +
         ". Please call them now." + getLocationText(info);
}
