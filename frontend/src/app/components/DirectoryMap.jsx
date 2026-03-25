import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Briefcase } from 'lucide-react'

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Mock coordinate mapping for cities without backend lat/lng
const cityCoordinates = {
  Bengaluru: [12.9716, 77.5946],
  Mumbai: [19.076, 72.8777],
  Delhi: [28.7041, 77.1025],
  Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567],
  Chennai: [13.0827, 80.2707],
  // default to center of India if not found
  default: [20.5937, 78.9629],
}

export default function DirectoryMap({ profiles, onProfileClick }) {
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    // Generate valid locations with slight jitter so markers in same city don't completely overlap
    const newMarkers = profiles.map((profile) => {
      const baseCoords = cityCoordinates[profile.city] || cityCoordinates['default']
      const jitterLat = (Math.random() - 0.5) * 0.1
      const jitterLng = (Math.random() - 0.5) * 0.1

      return {
        ...profile,
        position: [baseCoords[0] + jitterLat, baseCoords[1] + jitterLng],
      }
    })
    setTimeout(() => {
      setMarkers(newMarkers)
    }, 0)
  }, [profiles])

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {markers.map((profile) => (
            <Marker key={profile.id} position={profile.position}>
              <Popup className="rounded-xl overflow-hidden">
                <div className="w-48 cursor-pointer" onClick={() => onProfileClick(profile)}>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={
                        profile.avatar ||
                        `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=f3f4f6&color=2563eb`
                      }
                      alt={profile.first_name}
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {profile.first_name} {profile.last_name}
                      </h4>
                      <p className="text-xs text-gray-500">{profile.graduation_year}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 font-medium line-clamp-1 mb-1">
                    {profile.headline || profile.current_position}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2">
                    <Briefcase className="w-3 h-3" />
                    <span className="truncate">{profile.current_company}</span>
                  </div>
                  <button className="w-full mt-3 bg-blue-50 text-blue-600 font-medium py-1.5 rounded-lg text-xs hover:bg-blue-100 transition-colors">
                    View Profile
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
