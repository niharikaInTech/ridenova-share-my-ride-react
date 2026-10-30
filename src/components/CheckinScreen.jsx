// CheckinScreen.jsx
// After a night ride we ask "Did you reach safely?".
//   Yes             -> the rider can tell the contacts on WhatsApp
//   No / no reply   -> the rider can alert the contacts, and the 112 button is shown

import { useState, useEffect } from "react";
import WhatsAppButtons from "./WhatsAppButtons";
import { CHECKIN_WAIT_SECONDS } from "../constants";
import { buildSafeMessage, buildAlertMessage } from "../messages";

export default function CheckinScreen({ riderName, drop, sharedContacts, messageInfo, onNewRide }) {
  // answer is "waiting" at first, then "safe" or "alert"
  const [answer, setAnswer] = useState("waiting");
  const [alertReason, setAlertReason] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(CHECKIN_WAIT_SECONDS);

  // Countdown: runs every second, but only while we are still waiting for the answer
  useEffect(function () {
    if (answer !== "waiting") {
      return;
    }
    const id = setInterval(function () {
      setSecondsLeft(function (old) { return old - 1; });
    }, 1000);
    return function () {
      clearInterval(id);
    };
  }, [answer]);

  // If the time runs out, we treat it as a problem
  useEffect(function () {
    if (answer === "waiting" && secondsLeft <= 0) {
      setAlertReason("did not reply to the safety check-in");
      setAnswer("alert");
    }
  }, [secondsLeft, answer]);

  function handleNo() {
    setAlertReason("said they need help");
    setAnswer("alert");
  }

  const answered = answer !== "waiting";

  return (
    <section>
      <h2>Safety check-in</h2>
      <div className="bubble">
        Hi {riderName}, you have reached {drop.name}. Did you get home safely?
      </div>

      <div className="row">
        <button type="button" className="good" disabled={answered} onClick={function () { setAnswer("safe"); }}>
          Yes, I reached safely
        </button>
        <button type="button" className="danger" disabled={answered} onClick={handleNo}>
          No, I need help
        </button>
      </div>

      {!answered && (
        <p className="hint">No reply in {secondsLeft} seconds? We will alert your contacts.</p>
      )}

      {answer === "safe" && (
        <div>
          <div className="result good">Glad you are safe. Let your contacts know:</div>
          <WhatsAppButtons
            contacts={sharedContacts}
            getMessage={function () { return buildSafeMessage(messageInfo); }}
            label="Tell"
          />
        </div>
      )}

      {answer === "alert" && (
        <div>
          <div className="result bad">We are alerting your trusted contacts. If you are in danger, call 112 now.</div>
          <WhatsAppButtons
            contacts={sharedContacts}
            getMessage={function () { return buildAlertMessage(messageInfo, alertReason); }}
            label="Alert"
          />
          <a className="callBtn" href="tel:112">Call 112 (emergency)</a>
        </div>
      )}

      {answered && (
        <div>
          <p className="hint">A real app would send this automatically from a server. In this demo, tap a button, then press send in WhatsApp.</p>
          <button type="button" className="primary" onClick={onNewRide}>Book another ride</button>
        </div>
      )}
    </section>
  );
}
