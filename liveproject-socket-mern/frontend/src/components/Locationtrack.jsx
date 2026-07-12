import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icon problem
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Map center update component
function ChangeMapCenter({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 16);
  }, [latitude, longitude, map]);

  return null;
}

function Locationtrack() {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("Click Start Tracking button");
  const [tracking, setTracking] = useState(false);

  const watchId = useRef(null);

  // Save location in MongoDB
  const saveLocation = async (position) => {
    try {
      const locationData = {
        userName: "Student User",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(locationData);

      await axios.post("http://localhost:5500/api/location/save", locationData);

      setMessage("Location updated and saved");
    } catch (error) {
      console.error(error);
      setMessage("Location found but database save failed");
    }
  };

  // Geolocation error
  const locationError = (error) => {
    console.error(error);

    if (error.code === 1) {
      setMessage("Location permission denied");
    } else if (error.code === 2) {
      setMessage("Location is unavailable");
    } else if (error.code === 3) {
      setMessage("Location request timed out");
    } else {
      setMessage("Unable to get location");
    }

    setTracking(false);
  };

  // Start live tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support geolocation");
      return;
    }

    setTracking(true);
    setMessage("Getting your location...");

    watchId.current = navigator.geolocation.watchPosition(
      saveLocation,
      locationError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking(false);
    setMessage("Location tracking stopped");
  };

  // Cleanup when component closes
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div className="page">
      <div className="header">
        <h1>MERN Location Tracker</h1>
        <p>Track and display your live location</p>
      </div>

      <div className="controls">
        <button
          className="start-button"
          onClick={startTracking}
          disabled={tracking}
        >
          Start Tracking
        </button>

        <button
          className="stop-button"
          onClick={stopTracking}
          disabled={!tracking}
        >
          Stop Tracking
        </button>
      </div>

      <div className="status">
        <strong>Status:</strong> {message}
      </div>

      {location ? (
        <>
          <div className="location-details">
            <div>
              <span>Latitude</span>
              <strong>{location.latitude}</strong>
            </div>

            <div>
              <span>Longitude</span>
              <strong>{location.longitude}</strong>
            </div>

            <div>
              <span>Accuracy</span>
              <strong>{Math.round(location.accuracy)} metres</strong>
            </div>
          </div>

          <div className="map-box">
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={16}
              className="map"
            >
              <ChangeMapCenter
                latitude={location.latitude}
                longitude={location.longitude}
              />

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={[location.latitude, location.longitude]}>
                <Popup>
                  <strong>Your current location</strong>
                  <br />
                  Latitude: {location.latitude}
                  <br />
                  Longitude: {location.longitude}
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <a
            className="google-link"
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Open Location in Google Maps
          </a>
        </>
      ) : (
        <div className="empty-map">
          Location permission দেওয়ার পরে map দেখা যাবে।
        </div>
      )}
    </div>
  );
}

export default Locationtrack;
