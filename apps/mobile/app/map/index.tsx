import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function FieldMapScreen() {
    const router = useRouter();
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProspects();
    }, []);

    const fetchProspects = async () => {
        try {
            const { data, error } = await supabase
                .from('prospects')
                .select('*')
                .not('gps_latitude', 'is', null);

            if (error) throw error;
            setProspects(data || []);
        } catch (error) {
            console.error('Fetch map error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={{ marginTop: 10, color: '#64748B' }}>Chargement de la carte...</Text>
            </View>
        );
    }

    // Default center (Abidjan area)
    const initialRegion = {
        latitude: prospects.length > 0 ? prospects[0].gps_latitude : 5.3484,
        longitude: prospects.length > 0 ? prospects[0].gps_longitude : -4.0305,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#11181C" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Carte Terrain</Text>
            </View>

            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {prospects.map((p) => (
                    <Marker
                        key={p.id}
                        coordinate={{
                            latitude: p.gps_latitude,
                            longitude: p.gps_longitude,
                        }}
                        pinColor={p.status === 'converted' ? '#10B981' : '#EF4444'}
                    >
                        <Callout onPress={() => router.push(`/prospects` as any)}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{p.company || p.first_name}</Text>
                                <Text style={styles.calloutSubtitle}>{p.establishment_type || 'Établissement'}</Text>
                                <View style={[
                                    styles.statusBadge, 
                                    { backgroundColor: p.status === 'converted' ? '#ECFDF5' : '#F1F5F9' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: p.status === 'converted' ? '#059669' : '#64748B' }
                                    ]}>
                                        {p.status}
                                    </Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20, 
        paddingTop: Platform.OS === 'ios' ? 20 : 50,
        zIndex: 10, 
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginLeft: 16 },
    map: { flex: 1 },
    callout: { padding: 8, minWidth: 160 },
    calloutTitle: { fontWeight: '800', fontSize: 14, color: '#0F172A' },
    calloutSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }
});
