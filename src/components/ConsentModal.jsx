export default function ConsentModal({ onYes, onNo }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="consentTitle">
      <div className="modalBox">
        <h2 id="consentTitle">Share your live location?</h2>
        <p>
          Your trusted contacts can then get your location on WhatsApp during this ride.
          It is used only for this ride, and you can stop sharing from the ride screen.
        </p>
        <button type="button" className="primary" onClick={onYes}>Yes, share my location</button>
        <button type="button" className="secondary" onClick={onNo}>No, continue without it</button>
      </div>
    </div>
  );
}
