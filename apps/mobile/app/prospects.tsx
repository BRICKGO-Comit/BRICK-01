import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    Platform,
    ActivityIndicator,
    TextInput,
    Linking,
    Alert
} from 'react-native';
import {
    ArrowLeft,
    Search,
    Phone,
    MessageCircle,
    MapPin,
    Calendar,
    ChevronRight,
    User,
    Filter,
    Plus,
    Utensils
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function ProspectsListScreen() {
    const router = useRouter();
    const [prospects, setProspects] = useState<any[]>([]);
    const [filteredProspects, setFilteredProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchProspects();

        const channel = supabase
            .channel('prospects-list-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'prospects' },
                () => fetchProspects()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        let result = prospects;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.first_name || '').toLowerCase().includes(query) ||
                (p.last_name || '').toLowerCase().includes(query) ||
                (p.company || '').toLowerCase().includes(query) ||
                (p.phone || '').includes(query)
            );
        }

        if (filterStatus) {
            result = result.filter(p => p.status === filterStatus);
        }

        setFilteredProspects(result);
    }, [searchQuery, filterStatus, prospects]);

    const fetchProspects = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('prospects')
                .select('*')
                .eq('assigned_to', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProspects(data || []);
            setFilteredProspects(data || []);
        } catch (err) {
            console.error('Error fetching prospects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    const handleWhatsApp = (phone: string, name: string) => {
        if (!phone) return;
        // Clean phone number (remove spaces, etc.)
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`Bonjour ${name}, de la part de BRICK GO. Je vous contacte suite à notre rencontre.`);
        Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`).catch(() => {
            Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur votre appareil.');
        });
    };

    const getStatusColor = (status: string) => {
            case 'qualifié':
            case 'vendu':
            case 'success':
            case 'demo_done':
            case 'free_test_active':
                return { bg: '#ECFDF5', text: '#10B981' };
            case 'new':
            case 'nouveau':
            case 'waiting':
                return { bg: '#EEF2FF', text: '#4F46E5' };
            case 'en cours':
            case 'pending':
            case 'contacted':
                return { bg: '#FEF3C7', text: '#F59E0B' };
            case 'refused':
            case 'lost':
            case 'perdu':
                return { bg: '#FEF2F2', text: '#EF4444' };
            default:
                return { bg: '#F3F4F6', text: '#6B7280' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'demo_done': return 'Démo faite';
            case 'free_test_active': return 'Test gratuit';
            case 'new': return 'Nouveau';
            case 'waiting': return 'En attente';
            case 'contacted': return 'Contacté';
            default: return status;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#11181C" size={24} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mes Prospects</Text>
                    <Text style={styles.headerSubtitle}>{prospects.length} total</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/prospect/new')}
                >
                    <Plus color="#FFFFFF" size={24} />
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Search color="#94A3B8" size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un prospect..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter color="#4F46E5" size={20} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : filteredProspects.length > 0 ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredProspects.map((item) => {
                        const colors = getStatusColor(item.status);
                        return (
                            <View key={item.id} style={styles.prospectCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.prospectIdentity}>
                                        <View style={styles.avatar}>
                                            <User color="#4F46E5" size={24} />
                                        </View>
                                        <View>
                                            <Text style={styles.prospectName}>{item.first_name} {item.last_name}</Text>
                                            {item.company ? (
                                                <Text style={styles.prospectCompany}>{item.company}</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                        <Text style={[styles.statusText, { color: colors.text }]}>
                                            {getStatusLabel(item.status)}
                                        </Text>
                                    </View>
                                </View>

                                {item.department === 'brick_food' && (
                                    <View style={styles.foodBadge}>
                                        <Utensils size={10} color="#4F46E5" />
                                        <Text style={styles.foodBadgeText}>BRICK FOOD</Text>
                                    </View>
                                )}

                                <View style={styles.cardBody}>
                                    {item.need ? (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Besoin:</Text>
                                            <Text style={styles.infoValue} numberOfLines={1}>{item.need}</Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.infoRow}>
                                        <Calendar color="#94A3B8" size={14} />
                                        <Text style={styles.dateText}>
                                            Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                        </Text>
                                    </View>
                                    {item.address ? (
                                        <View style={styles.infoRow}>
                                            <MapPin color="#94A3B8" size={14} />
                                            <Text style={styles.dateText}>{item.address}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.cardFooter}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.callBtn]}
                                        onPress={() => handleCall(item.phone)}
                                    >
                                        <Phone color="#4F46E5" size={18} />
                                        <Text style={styles.callBtnText}>Appeler</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.waBtn]}
                                        onPress={() => handleWhatsApp(item.phone, item.first_name)}
                                    >
                                        <MessageCircle color="#10B981" size={18} />
                                        <Text style={styles.waBtnText}>WhatsApp</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ height: 40 }} />
                </ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>Aucun prospect trouvé</Text>
                    <Text style={styles.emptySubtitle}>Commencez par ajouter de nouveaux clients pour les voir ici.</Text>
                    <TouchableOpacity
                        style={styles.emptyAddBtn}
                        onPress={() => router.push('/prospect/new')}
                    >
                        <Text style={styles.emptyAddBtnText}>Ajouter un prospect</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 12,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#0F172A',
        fontSize: 15,
    },
    filterBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    prospectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    foodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 12,
        gap: 4,
    },
    foodBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4F46E5',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    prospectIdentity: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    prospectName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    prospectCompany: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: 16,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    infoValue: {
        fontSize: 14,
        color: '#0F172A',
        fontWeight: '500',
        flex: 1,
    },
    dateText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
    },
    callBtn: {
        borderColor: '#E0E7FF',
        backgroundColor: '#F5F7FF',
    },
    callBtnText: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '700',
    },
    waBtn: {
        borderColor: '#D1FAE5',
        backgroundColor: '#F0FDF4',
    },
    waBtnText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '700',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    emptyAddBtn: {
        marginTop: 24,
        backgroundColor: '#4F46E5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyAddBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    }
});
