import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Award, TrendingUp, Users, Crown, Medal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface AgentScore {
    id: string;
    full_name: string;
    prospect_count: number;
    converted_count: number;
}

export default function LeaderboardScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<AgentScore[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get current agent's department
            const { data: myProfile } = await supabase
                .from('profiles')
                .select('department')
                .eq('id', user.id)
                .single();
            
            const userDept = myProfile?.department || 'brick_core';

            // Fetch all commercial profiles IN THE SAME DEPARTMENT
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'commercial')
                .eq('department', userDept);

            if (pError) throw pError;

            // Fetch prospect counts IN THE SAME DEPARTMENT
            const { data: prospects, error: prError } = await supabase
                .from('prospects')
                .select('assigned_to, status')
                .eq('department', userDept);

            if (prError) throw prError;

            const scores: AgentScore[] = (profiles || []).map(profile => {
                const userProspects = (prospects || []).filter(p => p.assigned_to === profile.id);
                return {
                    id: profile.id,
                    full_name: profile.full_name || 'Agent Anonyme',
                    prospect_count: userProspects.length,
                    converted_count: userProspects.filter(p => 
                        ['converted', 'Qualifié', 'won', 'vendu', 'success'].includes(p.status)
                    ).length
                };
            });

            // Sort by converted count, then prospect count
            scores.sort((a, b) => b.converted_count - a.converted_count || b.prospect_count - a.prospect_count);

            setLeaderboard(scores);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const podium = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Classement Agents</Text>
                <View style={{ width: 44 }} />
            </View>

            <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.topGradient}>
                <View style={styles.podiumContainer}>
                    {/* Size 2 */}
                    {podium[1] && (
                        <View style={[styles.podiumItem, { height: 140 }]}>
                            <View style={styles.avatarWrapper}>
                                <Image source={{ uri: `https://ui-avatars.com/api/?name=${podium[1].full_name}&background=random` }} style={[styles.avatar, { borderColor: '#E5E7EB' }]} />
                                <View style={[styles.rankBadge, { backgroundColor: '#94A3B8' }]}>
                                    <Text style={styles.rankBadgeText}>2</Text>
                                </View>
                            </View>
                            <Text style={styles.userName} numberOfLines={1}>{podium[1].full_name.split(' ')[0]}</Text>
                            <Text style={styles.userScore}>{podium[1].converted_count} Qualifiés</Text>
                        </View>
                    )}

                    {/* Size 1 (Center) */}
                    {podium[0] && (
                        <View style={[styles.podiumItem, { height: 180, marginBottom: 20 }]}>
                            <View style={styles.avatarWrapper}>
                                <Crown color="#FBBF24" size={24} style={styles.crownIcon} />
                                <Image source={{ uri: `https://ui-avatars.com/api/?name=${podium[0].full_name}&background=random` }} style={[styles.avatar, { width: 80, height: 80, borderRadius: 40, borderColor: '#FBBF24', borderWidth: 3 }]} />
                                <View style={[styles.rankBadge, { backgroundColor: '#FBBF24', width: 28, height: 28, borderRadius: 14 }]}>
                                    <Text style={styles.rankBadgeText}>1</Text>
                                </View>
                            </View>
                            <Text style={[styles.userName, { fontSize: 16, fontWeight: '800' }]} numberOfLines={1}>{podium[0].full_name.split(' ')[0]}</Text>
                            <Text style={[styles.userScore, { color: '#FBBF24' }]}>{podium[0].converted_count} Qualifiés</Text>
                        </View>
                    )}

                    {/* Size 3 */}
                    {podium[2] && (
                        <View style={[styles.podiumItem, { height: 120 }]}>
                            <View style={styles.avatarWrapper}>
                                <Image source={{ uri: `https://ui-avatars.com/api/?name=${podium[2].full_name}&background=random` }} style={[styles.avatar, { borderColor: '#D97706' }]} />
                                <View style={[styles.rankBadge, { backgroundColor: '#D97706' }]}>
                                    <Text style={styles.rankBadgeText}>3</Text>
                                </View>
                            </View>
                            <Text style={styles.userName} numberOfLines={1}>{podium[2].full_name.split(' ')[0]}</Text>
                            <Text style={styles.userScore}>{podium[2].converted_count} Qualifiés</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Top Performeurs</Text>
                    <TrendingUp color="#64748B" size={18} />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
                ) : (
                    rest.map((item, index) => (
                        <View key={item.id} style={styles.agentRow}>
                            <Text style={styles.rowRank}>{index + 4}</Text>
                            <Image source={{ uri: `https://ui-avatars.com/api/?name=${item.full_name}&background=random` }} style={styles.rowAvatar} />
                            <View style={styles.rowInfo}>
                                <Text style={styles.rowName}>{item.full_name}</Text>
                                <Text style={styles.rowStats}>{item.prospect_count} prospects au total</Text>
                            </View>
                            <View style={styles.rowScoreContainer}>
                                <Text style={styles.rowScoreValue}>{item.converted_count}</Text>
                                <Text style={styles.rowScoreLabel}>Qualifiés</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 50,
        backgroundColor: '#4F46E5',
        height: 120,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
    },
    topGradient: {
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    podiumContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    podiumItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    avatarWrapper: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    rankBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    crownIcon: {
        position: 'absolute',
        top: -25,
        zIndex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    userScore: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#11181C',
    },
    agentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    rowRank: {
        width: 30,
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
    },
    rowAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 15,
    },
    rowInfo: {
        flex: 1,
    },
    rowName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#11181C',
    },
    rowStats: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    rowScoreContainer: {
        alignItems: 'flex-end',
    },
    rowScoreValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#4F46E5',
    },
    rowScoreLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
    }
});
