'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (result: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

let optionsSet = false;
let placesPromise: Promise<google.maps.PlacesLibrary> | null = null;
let geocodingPromise: Promise<google.maps.GeocodingLibrary> | null = null;

function ensureOptions() {
  if (!optionsSet) {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' });
    optionsSet = true;
  }
}

function getPlacesLibrary() {
  if (!placesPromise) {
    ensureOptions();
    placesPromise = importLibrary('places');
  }
  return placesPromise;
}

function getGeocodingLibrary() {
  if (!geocodingPromise) {
    ensureOptions();
    geocodingPromise = importLibrary('geocoding');
  }
  return geocodingPromise;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing an address...',
  required,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Keep refs so the listener always calls the latest version
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let mounted = true;

    getPlacesLibrary().then(() => {
      if (!mounted || !inputRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
        componentRestrictions: { country: 'za' },
        fields: ['formatted_address', 'geometry'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location && place.formatted_address) {
          const result = {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          onChangeRef.current(result.address);
          onSelectRef.current(result);
          setLocationSet(true);
          setLocateError(null);
        }
      });

      autocompleteRef.current = autocomplete;
      setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationSet(false);
    setLocateError(null);
    onChange(e.target.value);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const { Geocoder } = await getGeocodingLibrary();
          const geocoder = new Geocoder();
          const response = await geocoder.geocode({
            location: { lat, lng },
          });

          if (response.results[0]) {
            const address = response.results[0].formatted_address;
            onChangeRef.current(address);
            onSelectRef.current({ address, lat, lng });
            setLocationSet(true);
          } else {
            setLocateError('Could not determine address for your location');
          }
        } catch {
          setLocateError('Failed to get address from coordinates');
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocateError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocateError('Location unavailable');
            break;
          case err.TIMEOUT:
            setLocateError('Location request timed out');
            break;
          default:
            setLocateError('Could not get your location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={className || 'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm'}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {!ready ? (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          ) : (
            <MapPin size={16} className={locationSet ? 'text-green-600' : 'text-muted-foreground'} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/90 disabled:opacity-50 cursor-pointer"
        >
          {locating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LocateFixed size={13} />
          )}
          {locating ? 'Getting location...' : 'Use current location'}
        </button>
        {locationSet && (
          <span className="text-xs text-green-600">Location set</span>
        )}
        {locateError && (
          <span className="text-xs text-red-600">{locateError}</span>
        )}
      </div>
    </div>
  );
}
