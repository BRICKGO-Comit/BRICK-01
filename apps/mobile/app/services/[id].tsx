import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle, Briefcase, Info } from 'lucide-react-native';

export default function ServiceDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState("FCFA");

    useEffect(() => {
        fetchServiceDetails();
        fetchCurrency();
    }, [id]);

    const fetchCurrency = async () => {
        const { data } = await supabase.from('app_settings').select('currency_symbol').single();
        if (data) setCurrency(data.currency_symbol);
    };

    const fetchServiceDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setService(data);
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!service) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Service introuvable</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonIcon}>
                    <ArrowLeft size={24} color="#11181C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails du Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconWrapper}>
                    <Briefcase size={40} color="#4F46E5" />
                </View>

                <Text style={styles.title}>{service.title}</Text>
                <Text style={styles.price}>{service.price} {currency}</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{service.category}</Text>
                </View>

                <View style={styles.infoBox}>
                    <View style={styles.infoHeader}>
                        <Info size={18} color="#4F46E5" />
                        <Text style={styles.infoTitle}>Description</Text>
                    </View>
                    <Text style={styles.description}>
                        {service.description || "Aucune description disponible pour ce service."}
                    </Text>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => router.push({
                        pathname: '/prospect/new',
                        params: { service: service.title, serviceId: service.id }
                    } as any)}
                >
                    <Text style={styles.selectButtonText}>Sélectionner ce service</Text>
                    <CheckCircle size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#EF4444',
        marginBottom: 16,
    },
    backButton: {
        padding: 10,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#4F46E5',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    backButtonIcon: {
        padding: 8,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 8,
    },
    price: {
        fontSize: 32,
        fontWeight: '900',
        color: '#4F46E5',
        marginBottom: 16,
    },
    badge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 32,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    infoBox: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginLeft: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
    },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingBottom: 40,
    },
    selectButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    selectButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 10,
    },
});
