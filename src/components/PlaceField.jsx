import { useState, useId } from "react";
import { searchPlaces, reverseGeocode } from "../api";

export default function PlaceField({ label, placeholder, place, onChoose, onClear, allowCurrentLocation }) {
  const inputId = useId();

  const [text, setText] = useState(place ? place.name : "");
  const [results, setResults] = useState([]);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  function handlePick(chosenPlace) {
    setText(chosenPlace.name);
    setResults([]);
    setInfo("");
    setError("");
    onChoose(chosenPlace);
  }

  function handleChange(event) {
    setText(event.target.value);
    if (place) {
      onClear();
    }
  }

  async function handleSearch() {
    const query = text.trim();
    setError("");

    if (query.length < 3) {
      setError("Type at least 3 letters to search.");
      return;
    }

    setInfo("Searching...");
    setResults([]);
    try {
      const found = await searchPlaces(query);
      setResults(found);
      setInfo(found.length === 0 ? "No places found. Try another name." : "");
    } catch (err) {
      setInfo("");
      setError("Could not search places. Check your internet and try again.");
    }
  }

  function handleUseLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      let name = "My current location";
      try {
        name = await reverseGeocode(lat, lng);
      } catch (err) {
      }
      handlePick({ name, fullName: name, lat, lng });
    }, function () {
      setError("Could not get your location. Allow location access, or search for a place.");
    });
  }

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <div className="searchRow">
        <input
          type="text"
          id={inputId}
          value={text}
          placeholder={placeholder}
          autoComplete="off"
          onChange={handleChange}
          onKeyDown={function (event) {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </div>

      {allowCurrentLocation && (
        <button type="button" className="linkBtn" onClick={handleUseLocation}>
          Use my current location
        </button>
      )}

      {info && <p className="hint">{info}</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {results.map(function (result, index) {
          return (
            <button type="button" className="resultItem" key={index} onClick={function () { handlePick(result); }}>
              {result.fullName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
