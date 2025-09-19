
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

// Coordenadas iniciales (ej. Cuenca, Ecuador)
const defaultCenter = {
  lat: -2.9001,
  lng: -79.0059,
};

type MapPickerProps = {
  // Coordenadas actuales para centrar el mapa y mostrar el marcador
  location: { lat: number; lng: number } | null;
  // Función para notificar al formulario padre cuando la ubicación cambia
  onLocationChange: (location: { lat: number; lng: number }) => void;
};

export function MapPicker({ location, onLocationChange }: MapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Carga la clave desde .env
  });

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      onLocationChange(newLocation);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="text-slate-500">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={location || defaultCenter}
      zoom={14}
      onClick={handleMapClick}
      options={{
        
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
     
      {location && <Marker position={location} />}
    </GoogleMap>
  );
}
