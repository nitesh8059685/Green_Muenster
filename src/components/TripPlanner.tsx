import { useState } from 'react';
import { Bike, Car, Footprints } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Map from './Map';

type TransportMode = 'walking' | 'cycling' | 'jogging' | 'car';
type CO2Mode = 'car' | 'cycling' | 'walking' | 'jogging';

type RouteResult = {
  distance: number; // km
  duration: number; // minutes
  co2Emissions: Record<CO2Mode, number>;
};

const CO2_FACTORS: Record<CO2Mode, number> = {
  car: 0.192,
  cycling: 0,
  walking: 0,
  jogging: 0,
};

const transportModes: {
  id: TransportMode;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}[] = [
  { id: 'walking', label: 'Walking', icon: Footprints, color: 'bg-green-500' },
  { id: 'jogging', label: 'Jogging', icon: Footprints, color: 'bg-teal-500' },
  { id: 'cycling', label: 'Cycling', icon: Bike, color: 'bg-emerald-500' },
  { id: 'car', label: 'Car', icon: Car, color: 'bg-red-500' },
];

// -------------------- Fallback COORDS --------------------
const FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  Hauptbahnhof: { lat: 51.9625, lng: 7.6251 },
  Prinzipalmarkt: { lat: 51.9609, lng: 7.626 },
  'Schloss Münster': { lat: 51.9618, lng: 7.6178 },
};

// -------------------- Münster locations for autocomplete --------------------
const MUNSTER_LOCATIONS = [
  'bahnhof', 'Prinzipalmarkt', 'Schloss Münster', 'Aasee', 'Erbdrostenhof',
  'LWL-Museum für Kunst und Kultur', 'Allwetterzoo Münster', 'St. Paulus Dom',
  'Mauritzviertel', 'Hafenviertel', 'Stadthaus Münster', 'Rathaus Münster',
  'Botanischer Garten', 'Kiepenkerl', 'Clemenskirche', 'Kardinal-von-Galen-Ring',
  'Königsstraße', 'Buddenturm', 'Aegidiikirche', 'Kunsthalle Münster', 'Theater Münster',
  'Zooallee', 'Hansaring', 'Dreieinigkeitskirche', 'Schlossplatz', 'Kardinal-von-Galen-Platz',
  'Berliner Platz', 'Hüfferstraße', 'Coermühle', 'Aaseeterrassen', 'Ringstraße',
  'Sentruper Höhe', 'Roxel', 'Gievenbeck', 'Kinderhaus', 'Mecklenbeck',
  'Hiltrup', 'Handorf', 'Albachten', 'Angelmodde', 'Mauritzstraße',
  'Erbdrostenstraße', 'Kardinal-von-Galen-Weg', 'Klinikum Münster', 'Lindenstraße',
  'Neubrückenstraße', 'Rochusplatz', 'Piusallee', 'Alter Steinweg', 'Domplatz'
];

export default function TripPlanner() {
  const { profile } = useAuth();

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  const [selectedMode, setSelectedMode] = useState<TransportMode>('cycling');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<string | null>(null);

  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // -------------------- Autocomplete handlers --------------------
  const handleFromChange = (value: string) => {
    setFromLocation(value);
    if (value.length === 0) {
      setFromSuggestions([]);
    } else {
      const filtered = MUNSTER_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFromSuggestions(filtered);
    }
  };

  const handleToChange = (value: string) => {
    setToLocation(value);
    if (value.length === 0) {
      setToSuggestions([]);
    } else {
      const filtered = MUNSTER_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setToSuggestions(filtered);
    }
  };

  /* -------------------- GEOCODING WITH FALLBACK -------------------- */
  const geocodeLocation = async (location: string) => {
    const fallbackKey = Object.keys(FALLBACK_COORDS).find((key) =>
      location.toLowerCase().includes(key.toLowerCase())
    );
    if (fallbackKey) return FALLBACK_COORDS[fallbackKey];

    const query = location.includes('Muenster') ? location : `${location}, Muenster, Germany`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=1`
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();

    if (!data.length) throw new Error(`Location not found: ${location}`);

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  };

  /* -------------------- ROUTING WITH ORS -------------------- */
  const getRoute = async (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    mode: TransportMode
  ) => {
    const profileMap: Record<TransportMode, string> = {
      walking: 'foot-walking',
      jogging: 'foot-walking',
      cycling: 'cycling-regular',
      car: 'driving-car',
    };

    const orsKey = import.meta.env.VITE_ORS_API_KEY;
    if (!orsKey) throw new Error('OpenRouteService API key is missing.');

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profileMap[mode]}`,
      {
        method: 'POST',
        headers: {
          Authorization: orsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [from.lng, from.lat],
            [to.lng, to.lat],
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) throw new Error('No route found.');

    const route = data.routes[0];

    return {
      geometry: route.geometry,
      distance: route.summary.distance / 1000,
      duration: route.summary.duration / 60,
    };
  };

  /* -------------------- MAIN ACTION -------------------- */
  const calculateRoute = async () => {
    if (!fromLocation || !toLocation) {
      setError('Please enter both locations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const from = await geocodeLocation(fromLocation);
      const to = await geocodeLocation(toLocation);

      setFromCoords(from);
      setToCoords(to);

      const route = await getRoute(from, to, selectedMode);

      const carCO2 = route.distance * CO2_FACTORS.car;

      const result: RouteResult = {
        distance: route.distance,
        duration: route.duration,
        co2Emissions: {
          car: carCO2,
          cycling: 0,
          walking: 0,
          jogging: 0,
        },
      };

      setRouteGeometry(route.geometry);
      setRouteResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Routing failed');
      setRouteResult(null);
      setRouteGeometry(null);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- SAVE TRIP + UPDATE CHALLENGES -------------------- */
  const saveTrip = async () => {
    if (!routeResult || !profile) return;

    setSaving(true);
    try {
      const carCO2 = routeResult.co2Emissions.car;
      const selectedCO2 = routeResult.co2Emissions[selectedMode as CO2Mode];
      const co2Saved = Math.max(0, carCO2 - selectedCO2);
      const points = Math.round(co2Saved * 10);

      // 1️⃣ Save the trip
      const { error: tripError } = await supabase.from('trips').insert({
        user_id: profile.id,
        from_location: fromLocation,
        to_location: toLocation,
        from_lat: fromCoords?.lat,
        from_lng: fromCoords?.lng,
        to_lat: toCoords?.lat,
        to_lng: toCoords?.lng,
        transport_mode: selectedMode,
        distance: routeResult.distance,
        co2_saved: co2Saved,
        points_earned: points,
      });
      if (tripError) throw tripError;

      // 2️⃣ Update profile totals
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_points: (profile.total_points || 0) + points,
          co2_saved: (profile.co2_saved || 0) + co2Saved,
          total_distance: (profile.total_distance || 0) + routeResult.distance,
        })
        .eq('id', profile.id)
        .select()
        .single();
      if (profileError) throw profileError;

      // 3️⃣ Update challenges
      const { data: userChallenges, error } = await supabase
        .from('user_challenges')
        .select(`
          id,
          current_progress,
          challenge:challenges (
            type,
            target_unit
          )
        `)
        .eq('user_id', profile.id)
        .eq('status', 'in_progress');

      if (error) throw error;

      for (const uc of userChallenges || []) {
        const challengeType = uc.challenge?.type;
        const shouldUpdate =
          challengeType === selectedMode ||
          challengeType === 'distance';
        if (shouldUpdate && uc.challenge?.target_unit === 'km') {
          await supabase
            .from('user_challenges')
            .update({
              current_progress: uc.current_progress + routeResult.distance,
            })
            .eq('id', uc.id);
        }
      }

      alert(`Trip saved! You earned ${points} points 🎉`);

      // Reset form
      setRouteResult(null);
      setRouteGeometry(null);
      setFromLocation('');
      setToLocation('');
      setFromCoords(null);
      setToCoords(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trip Planner</h1>

      {/* From input */}
      <div className="relative">
        <input
          value={fromLocation}
          onChange={(e) => handleFromChange(e.target.value)}
          placeholder="From location (e.g., Hauptbahnhof)"
          className="w-full p-3 border rounded"
        />
        {fromSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-auto rounded shadow">
            {fromSuggestions.map((loc) => (
              <li
                key={loc}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setFromLocation(loc);
                  setFromSuggestions([]);
                }}
              >
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* To input */}
      <div className="relative">
        <input
          value={toLocation}
          onChange={(e) => handleToChange(e.target.value)}
          placeholder="To location (e.g., Prinzipalmarkt)"
          className="w-full p-3 border rounded"
        />
        {toSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-auto rounded shadow">
            {toSuggestions.map((loc) => (
              <li
                key={loc}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setToLocation(loc);
                  setToSuggestions([]);
                }}
              >
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Transport modes */}
      <div className="flex gap-2 mt-2">
        {transportModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex-1 p-2 rounded-lg border-2 ${
                selectedMode === mode.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 inline mr-2" /> {mode.label}
            </button>
          );
        })}
      </div>

      {/* Calculate */}
      <button
        onClick={calculateRoute}
        disabled={loading}
        className="w-full bg-green-600 text-white p-3 rounded mt-2"
      >
        {loading ? 'Calculating…' : 'Calculate Route'}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {/* Map & Save */}
      {routeResult && (
        <>
          <Map
            fromLat={fromCoords?.lat}
            fromLng={fromCoords?.lng}
            toLat={toCoords?.lat}
            toLng={toCoords?.lng}
            routeGeometry={routeGeometry}
          />
          <p>
            Distance: <b>{routeResult.distance.toFixed(2)} km</b> | Duration:{' '}
            <b>{Math.round(routeResult.duration)} min</b>
          </p>
          <button
            onClick={saveTrip}
            disabled={saving}
            className="w-full bg-green-700 text-white p-3 rounded"
          >
            {saving ? 'Saving…' : 'Save Trip'}
          </button>
        </>
      )}
    </div>
  );
}