import { useState } from "react";
import PlaceField from "./PlaceField";

export default function SearchScreen({ pickup, drop, setPickup, setDrop, onSeeRoutes }) {
  const [loading, setLoading] = useState(false);

  async function handleSeeRoutes() {
    setLoading(true);
    await onSeeRoutes();
    setLoading(false);
  }

  return (
    <section>
      <h2>Where to?</h2>

      <PlaceField
        label="Pickup"
        placeholder="Search pickup, e.g. LB Nagar"
        place={pickup}
        onChoose={setPickup}
        onClear={function () { setPickup(null); }}
        allowCurrentLocation={true}
      />

      <PlaceField
        label="Drop-off"
        placeholder="Search drop, e.g. Hitech City"
        place={drop}
        onChoose={setDrop}
        onClear={function () { setDrop(null); }}
        allowCurrentLocation={false}
      />

      <button
        type="button"
        className="primary"
        disabled={!pickup || !drop || loading}
        onClick={handleSeeRoutes}
      >
        {loading ? "Finding routes..." : "See routes and fares"}
      </button>
    </section>
  );
}
