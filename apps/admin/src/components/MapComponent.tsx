"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent() {
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProspects();
    }, []);

    const fetchProspects = async () => {
        try {
            const { data, error } = await supabase
                .from('prospects')
                .select('*, assigned_profile:profiles(first_name, last_name)')
                .not('gps_latitude', 'is', null);

            if (error) throw error;
            setProspects(data || []);
        } catch (error) {
            console.error('Map fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-full w-full flex items-center justify-center bg-slate-50">Chargement de la carte...</div>;

    const center: [number, number] = prospects.length > 0 
        ? [prospects[0].gps_latitude, prospects[0].gps_longitude] 
        : [5.3484, -4.0305];

    return (
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {prospects.map((p) => (
                <Marker key={p.id} position={[p.gps_latitude, p.gps_longitude]}>
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-lg">{p.company || p.first_name}</h3>
                            <p className="text-sm text-slate-600">{p.establishment_type || 'Établissement'}</p>
                            <div className="mt-2 text-xs font-bold uppercase">
                                Statut: <span className={p.status === 'converted' ? 'text-green-600' : 'text-blue-600'}>{p.status}</span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                                Par: {p.assigned_profile?.first_name} {p.assigned_profile?.last_name}
                            </div>
                            {p.photo_exterior && (
                                <img src={p.photo_exterior} alt="Extérieur" className="mt-2 w-full h-24 object-cover rounded" />
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
