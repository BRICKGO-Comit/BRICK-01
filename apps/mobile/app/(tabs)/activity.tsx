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
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BarChart3,
    Users,
    CheckCircle2,
    Clock,
    ChevronRight,
    TrendingUp,
    Award,
    Loader2
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
    const [stats, setStats] = useState([
        { label: 'Prospects', value: '0', icon: Users, color: '#4F46E5' },
        { label: 'Qualifiés', value: '0', icon: CheckCircle2, color: '#10B981' },
        { label: 'Nouveaux', value: '0', icon: Clock, color: '#F59E0B' },
    ]);

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivityData();

        const channel = supabase
            .channel('activity-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'prospects' },
                () => fetchActivityData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchActivityData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('prospects')
                .select('*')
                .eq('assigned_to', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const total = data?.length || 0;
            const qualified = data?.filter(p => p.status === 'Qualifié').length || 0;
            const newOnes = data?.filter(p => p.status === 'Nouveau' || p.status === 'new').length || 0;

            setStats([
                { label: 'Prospects', value: total.toString(), icon: Users, color: '#4F46E5' },
                { label: 'Qualifiés', value: qualified.toString(), icon: CheckCircle2, color: '#10B981' },
                { label: 'Nouveaux', value: newOnes.toString(), icon: Clock, color: '#F59E0B' },
            ]);

            setHistory(data?.slice(0, 10) || []);
        } catch (err) {
            console.error('Error fetching activity:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mon Activité</Text>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Clock color="#9BA1A6" size={20} />
                        <Text style={styles.filterText}>7 Derniers Jours</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                                <stat.icon color={stat.color} size={20} />
                            </View>
                            <Text style={styles.statValueText}>{stat.value}</Text>
                            <Text style={styles.statLabelText}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Performance Chart Placeholder */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Objectifs Hebdo</Text>
                    <BarChart3 color="#4F46E5" size={20} />
                </View>

                <View style={styles.graphCard}>
                    <View style={styles.graphPlaceholder}>
                        {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                            <View key={i} style={styles.graphBarContainer}>
                                <View style={[styles.graphBar, { height: `${height}%` }]} />
                                <Text style={styles.graphDay}>{['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent History */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Historique Récent</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>Tout voir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.historyList}>
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#4F46E5" />
                        </View>
                    ) : history.length > 0 ? (
                        history.map((item, index) => (
                            <TouchableOpacity key={item.id} style={styles.historyItem}>
                                <View style={styles.historyIcon}>
                                    <Users color="#4F46E5" size={20} />
                                </View>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyName}>{item.first_name} {item.last_name}</Text>
                                    <Text style={styles.historyDate}>
                                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    item.status === 'Qualifié' ? styles.statusSuccess :
                                        item.status === 'Nouveau' || item.status === 'new' ? styles.statusInfo :
                                            styles.statusDanger
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        item.status === 'Qualifié' ? styles.statusTextSuccess :
                                            item.status === 'Nouveau' || item.status === 'new' ? styles.statusTextInfo :
                                                styles.statusTextDanger
                                    ]}>{item.status}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun prospect récent</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#11181C',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    filterText: {
        color: '#9BA1A6',
        fontSize: 12,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValueText: {
        color: '#11181C',
        fontSize: 18,
        fontWeight: '800',
    },
    statLabelText: {
        color: '#9BA1A6',
        fontSize: 10,
        marginTop: 2,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#11181C',
        fontSize: 18,
        fontWeight: '700',
    },
    seeAllText: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '600',
    },
    graphCard: {
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#F4F4F5',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    graphPlaceholder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        paddingTop: 10,
    },
    graphBarContainer: {
        alignItems: 'center',
        gap: 8,
        width: '10%',
    },
    graphBar: {
        width: 6,
        backgroundColor: '#4F46E5',
        borderRadius: 3,
        opacity: 0.8,
    },
    graphDay: {
        fontSize: 10,
        color: '#9BA1A6',
        fontWeight: '600',
    },
    historyList: {
        gap: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E4E4E7',
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#11181C',
    },
    historyDate: {
        fontSize: 12,
        color: '#9BA1A6',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusInfo: { backgroundColor: 'rgba(79, 70, 229, 0.15)' },
    statusSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    statusDanger: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
    statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    statusTextInfo: { color: '#4F46E5' },
    statusTextSuccess: { color: '#10B981' },
    statusTextDanger: { color: '#EF4444' },
    loaderContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9BA1A6',
        fontSize: 14,
        fontWeight: '500',
    },
});
