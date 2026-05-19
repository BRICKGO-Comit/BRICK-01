import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Navigation } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';

const INITIAL_REGION = {
    latitude: 5.3484,
    longitude: -4.0305,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

export default function FieldMapScreen() {
    const router = useRouter();
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState(INITIAL_REGION);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission de localisation refusée');
            } else {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    setRegion({
                        ...INITIAL_REGION,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                } catch (e) {
                    console.log('Error getting location', e);
                }
            }
            fetchProspects();
        })();
    }, []);

    const fetchProspects = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user's department for partitioning
            const { data: profile } = await supabase
                .from('profiles')
                .select('department')
                .eq('id', user.id)
                .single();
            
            const userDept = profile?.department || 'brick_core';

            const { data, error } = await supabase
                .from('prospects')
                .select('*')
                .eq('department', userDept)
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



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#11181C" size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.headerTitle}>Carte Terrain</Text>
                    {errorMsg && <Text style={{ fontSize: 10, color: '#EF4444' }}>{errorMsg}</Text>}
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={fetchProspects}>
                    <RefreshCw color="#4F46E5" size={20} />
                </TouchableOpacity>
            </View>

            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                showsMyLocationButton={false} // Custom button used instead
                showsCompass={true}
                mapType={Platform.OS === 'android' ? "none" : "standard"}
            >
                <UrlTile
                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />
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
                                    { backgroundColor: p.status === 'converted' || p.status === 'vendu' ? '#ECFDF5' : '#F1F5F9' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: p.status === 'converted' || p.status === 'vendu' ? '#059669' : '#64748B' }
                                    ]}>
                                        {p.status}
                                    </Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {prospects.length === 0 && !loading && (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Aucun prospect avec position GPS trouvé dans ce département.</Text>
                </View>
            )}

            <TouchableOpacity 
                style={styles.myLocationBtn}
                onPress={async () => {
                    const location = await Location.getCurrentPositionAsync({});
                    setRegion({
                        ...region,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }}
            >
                <Navigation color="#FFF" size={24} />
            </TouchableOpacity>
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
    refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    map: { flex: 1 },
    myLocationBtn: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    callout: { padding: 8, minWidth: 160 },
    calloutTitle: { fontWeight: '800', fontSize: 14, color: '#0F172A' },
    calloutSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    noDataContainer: {
        position: 'absolute',
        top: 120,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    noDataText: {
        color: '#64748B',
        fontSize: 13,
        textAlign: 'center',
    }
});
