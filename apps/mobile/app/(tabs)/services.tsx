import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Platform,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    Search,
    ChevronRight,
    ArrowUpRight,
    X,
    Briefcase,
    Zap
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function ServicesScreen() {
    const router = useRouter();
    const searchParams = useLocalSearchParams();
    const initialFilter = searchParams.filter as string;

    const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currency, setCurrency] = useState("FCFA");

    useEffect(() => {
        fetchServices();
        fetchCurrency();
        const channel = supabase
            .channel('services-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => fetchServices())
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data || []);
            setFilteredServices(data || []); // Initialize filtered with all fetched data
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchCurrency = async () => {
        const { data } = await supabase.from('app_settings').select('currency_symbol').single();
        if (data) setCurrency(data.currency_symbol);
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchServices();
    }, []);

    // Filter effect
    useEffect(() => {
        let filtered = services;
        // Filter by category
        if (activeFilter !== 'all') {
            filtered = filtered.filter(s =>
                // Flexible comparison: check if category exists and includes the filter string (case-insensitive)
                s.category && s.category.toLowerCase().includes(activeFilter.toLowerCase())
            );
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(query) ||
                s.description?.toLowerCase().includes(query) ||
                s.title?.toLowerCase().includes(query)
            );
        }
        setFilteredServices(filtered);
    }, [activeFilter, searchQuery, services]);

    const categories = [
        { id: 'all', label: 'Tous' },
        { id: 'Visibilité', label: 'Visibilité' },
        { id: 'Ventes', label: 'Ventes' },
        { id: 'Social', label: 'Social' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>Catalogue</Text>
                    <Text style={styles.headerSubtitle}>Nos solutions pour vos clients</Text>
                </View>
                {!isSearching ? (
                    <TouchableOpacity style={styles.searchBtn} onPress={() => setIsSearching(true)}>
                        <Search color="#11181C" size={22} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.searchBarWrapper}>
                        <Search color="#4F46E5" size={18} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher..."
                            placeholderTextColor="#9BA1A6"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                            <X color="#9BA1A6" size={18} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Quick Link to Formations */}
            <TouchableOpacity
                style={styles.formationBanner}
                onPress={() => router.push('/formations')}
            >
                <View style={styles.formationContent}>
                    <View style={styles.formationIcon}>
                        <Briefcase color="white" size={20} />
                    </View>
                    <View>
                        <Text style={styles.formationTitle}>Academy BRICK</Text>
                        <Text style={styles.formationSubtitle}>Accéder à nos modules de formation</Text>
                    </View>
                </View>
                <ArrowUpRight color="white" size={20} />
            </TouchableOpacity>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setActiveFilter(cat.id)}
                            style={[
                                styles.filterTag,
                                activeFilter === cat.id && styles.filterTagActive
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === cat.id && styles.filterTextActive
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={filteredServices}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.serviceCard}
                            activeOpacity={0.9}
                            onPress={() => router.push({
                                pathname: '/services/[id]',
                                params: { id: item.id }
                            } as any)}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                                        <Briefcase color="#4F46E5" size={20} />
                                    </View>
                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceText}>{item.price ? `${item.price} ${currency}` : 'Sur devis'}</Text>
                                    </View>
                                </View>

                                <Text style={styles.serviceTitle}>{item.title}</Text>
                                <Text style={styles.serviceDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.category || 'Service'}</Text>
                                    </View>
                                    <View style={styles.actionRow}>
                                        <Text style={styles.actionText}>Sélectionner</Text>
                                        <ArrowUpRight color="#4F46E5" size={16} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Zap color="#D1D5DB" size={48} />
                            <Text style={styles.emptyText}>Aucun service trouvé</Text>
                            <Text style={{ textAlign: 'center', marginTop: 8, color: '#64748B', fontSize: 13, paddingHorizontal: 40 }}>
                                Essayez de tirer vers le bas pour actualiser, ou vérifiez vos filtres.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 50,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#11181C',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    searchBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchBarWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#4F46E5',
        marginLeft: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#11181C',
    },
    filtersContainer: {
        marginBottom: 10,
    },
    filtersScroll: {
        paddingHorizontal: 24,
        gap: 10,
    },
    filterTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterTagActive: {
        backgroundColor: '#11181C',
        borderColor: '#11181C',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 24,
        gap: 16,
        paddingBottom: 40,
    },
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 6, // Inner padding for border effect if needed, but here used as container
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        color: '#059669',
        fontSize: 13,
        fontWeight: '700',
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#11181C',
        marginBottom: 8,
    },
    serviceDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    badge: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    badgeText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        color: '#9BA1A6',
        fontSize: 16,
        fontWeight: '500',
    },
    formationBanner: {
        marginHorizontal: 24,
        marginBottom: 16,
        backgroundColor: '#11181C',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    formationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    formationIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formationTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    formationSubtitle: {
        color: '#9BA1A6',
        fontSize: 12,
        fontWeight: '500',
    }
});
