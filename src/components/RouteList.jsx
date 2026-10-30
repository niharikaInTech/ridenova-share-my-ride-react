// RouteList.jsx
// The route buttons (Fastest, Shortest, ...). Tapping one chooses that route.

export default function RouteList({ routes, selectedRoute, onSelect }) {
  return (
    <div id="routeList">
      {routes.map(function (route) {
        const className = route === selectedRoute ? "routeChip selected" : "routeChip";
        return (
          <button type="button" className={className} key={route.name} onClick={function () { onSelect(route); }}>
            <strong>{route.name}</strong>
            <span>{route.minutes} min, {route.distanceKm.toFixed(1)} km</span>
          </button>
        );
      })}
    </div>
  );
}
