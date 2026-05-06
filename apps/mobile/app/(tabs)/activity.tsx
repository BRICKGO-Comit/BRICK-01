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
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    BarChart3,
    Users,
    CheckCircle2,
    Clock,
    ChevronRight,
    TrendingUp,
    Award,
    Loader2,
    RefreshCcw,
    WifiOff,
    Target,
    Zap,
    ArrowUpRight
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { OfflineManager } from '../../lib/offline';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
    const router = useRouter();
    const [stats, setStats] = useState([
        { label: 'Prospects', value: '0', icon: Users, color: '#6366F1', trend: '+12%' },
        { label: 'Qualifiés', value: '0', icon: CheckCircle2, color: '#10B981', trend: '+5%' },
        { label: 'Nouveaux', value: '0', icon: Clock, color: '#F59E0B', trend: 'Stable' },
    ]);

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingSync, setPendingSync] = useState(0);

    useEffect(() => {
        fetchActivityData();
        checkOfflineQueue();

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

    const checkOfflineQueue = async () => {
        const queue = await OfflineManager.getQueue();
        setPendingSync(queue.length);

        if (queue.length > 0) {
            const synced = await OfflineManager.syncQueue();
            if (synced > 0) {
                setPendingSync(prev => prev - synced);
                fetchActivityData();
            }
        }
    };

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
            const qualified = data?.filter(p => p.status === 'Qualifié' || p.status === 'converted').length || 0;
            const newOnes = data?.filter(p => p.status === 'Nouveau' || p.status === 'new').length || 0;

            setStats([
                { label: 'Prospects', value: total.toString(), icon: Users, color: '#6366F1', trend: '+12%' },
                { label: 'Qualifiés', value: qualified.toString(), icon: CheckCircle2, color: '#10B981', trend: '+5%' },
                { label: 'Nouveaux', value: newOnes.toString(), icon: Clock, color: '#F59E0B', trend: 'Stable' },
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
                {pendingSync > 0 && (
                    <View style={styles.syncBanner}>
                        <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.syncGradient}>
                            <WifiOff color="#D97706" size={18} />
                            <Text style={styles.syncBannerText}>{pendingSync} prospects en attente</Text>
                            <TouchableOpacity style={styles.syncMiniBtn} onPress={checkOfflineQueue}>
                                <RefreshCcw color="#D97706" size={14} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}

                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerSubtitle}>Bonjour l'expert,</Text>
                        <Text style={styles.headerTitle}>Mon Activité</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.leaderboardTrigger}
                        onPress={() => router.push('/leaderboard' as any)}
                    >
                        <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.leaderboardIcon}>
                            <Award color="#FFFFFF" size={24} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Performance Highlights */}
                <View style={styles.goalCard}>
                    <LinearGradient colors={['#1F2937', '#111827']} style={styles.goalGradient}>
                        <View style={styles.goalHeader}>
                            <View style={styles.goalInfo}>
                                <Target color="#10B981" size={20} />
                                <Text style={styles.goalTitle}>Objectif Conversion</Text>
                            </View>
                            <Text style={styles.goalPercent}>75%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '75%' }]} />
                        </View>
                        <View style={styles.goalFooter}>
                            <Text style={styles.goalRemaining}>Encore 3 signatures pour atteindre l'objectif !</Text>
                            <Zap color="#FBBF24" size={14} fill="#FBBF24" />
                        </View>
                    </LinearGradient>
                </View>

                {/* Stats Grid - Bento Style */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={[styles.statCard, { borderLeftColor: stat.color, borderLeftWidth: 4 }]}>
                            <View style={styles.statTop}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                                    <stat.icon color={stat.color} size={18} />
                                </View>
                                {index === 0 && <ArrowUpRight color="#10B981" size={16} />}
                            </View>
                            <Text style={styles.statValueText}>{stat.value}</Text>
                            <Text style={styles.statLabelText}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent Activity List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Flux d'activité</Text>
                    <TouchableOpacity onPress={() => router.push('/prospects' as any)}>
                        <Text style={styles.seeAllText}>Historique complet</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.historyList}>
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#6366F1" />
                        </View>
                    ) : history.length > 0 ? (
                        history.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.historyItem} activeOpacity={0.7}>
                                <View style={[styles.historyAvatar, { backgroundColor: '#F3F4F6' }]}>
                                    <Text style={styles.avatarInitial}>{item.first_name[0]}{item.last_name[0]}</Text>
                                </View>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyName}>{item.first_name} {item.last_name}</Text>
                                    <Text style={styles.historyDetail}>{item.company || 'Particulier'} • {item.need || 'Formation'}</Text>
                                </View>
                                <View style={styles.historyRight}>
                                    <Text style={styles.historyTime}>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: item.status === 'Qualifié' || item.status === 'converted' ? '#10B981' : '#F59E0B' }
                                    ]} />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Users color="#E2E8F0" size={60} strokeWidth={1} />
                            <Text style={styles.emptyText}>Aucune activité récente pour le moment</Text>
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
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 50,
        paddingBottom: 40,
    },
    syncBanner: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    syncGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    syncBannerText: {
        flex: 1,
        color: '#D97706',
        fontSize: 13,
        fontWeight: '700',
    },
    syncMiniBtn: {
        padding: 6,
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        borderRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -1,
    },
    leaderboardTrigger: {
        elevation: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    leaderboardIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalCard: {
        marginBottom: 32,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    goalGradient: {
        padding: 24,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    goalTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    goalPercent: {
        color: '#10B981',
        fontSize: 20,
        fontWeight: '900',
    },
    progressBar: {
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 5,
        marginBottom: 16,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 5,
    },
    goalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    goalRemaining: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValueText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    statLabelText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    seeAllText: {
        fontSize: 13,
        color: '#6366F1',
        fontWeight: '700',
    },
    historyList: {
        gap: 14,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    historyAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarInitial: {
        fontSize: 16,
        fontWeight: '800',
        color: '#64748B',
    },
    historyInfo: {
        flex: 1,
    },
    historyName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    historyDetail: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    historyRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    historyTime: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    loaderContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

