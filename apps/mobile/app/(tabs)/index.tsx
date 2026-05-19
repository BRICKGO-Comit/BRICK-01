import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  Target,
  PlayCircle,
  UserPlus,
  GraduationCap,
  ChevronRight,
  Info,
  Bell,
  Wallet,
  Users,
  MapPin,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    prospects: 0,
    objective: 0,
    sales: 0,
    commission: 0,
    inscriptions: 0
  });
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isFood = userData?.profile?.department === 'brick_food';

  // Grouped Menu Items for better UX
  const mainActions = [
    { 
      id: 'prospect', 
      title: isFood ? 'Inscrire Établissement' : 'Nouveau Client', 
      subtitle: isFood ? 'Brick Food Terrain' : 'Enregistrer une visite', 
      icon: UserPlus, 
      color: '#FFFFFF', 
      bg: '#000000', 
      route: isFood ? '/prospect/food_new' : '/prospect/new', 
      width: '100%' 
    },
  ];

  if (isFood) {
    mainActions.push({
      id: 'map',
      title: 'Carte Terrain',
      subtitle: 'Voir les enregistrements',
      icon: MapPin,
      color: '#FFFFFF',
      bg: '#4F46E5',
      route: '/map',
      width: '100%'
    });
  }

  const resources = [
    { id: 'services', title: 'Services', icon: Briefcase, color: '#4F46E5', bg: '#EEF2FF', route: '/(tabs)/services' },
    { id: 'prospects', title: 'Mes Prospects', icon: Users, color: '#10B981', bg: '#ECFDF5', route: '/prospects' },
    { id: 'videos', title: 'Vidéos', icon: PlayCircle, color: '#F59E0B', bg: '#FEF3C7', route: '/videos' },
    { id: 'formations', title: 'Formations', icon: GraduationCap, color: '#EC4899', bg: '#FCE7F3', route: '/formations' },
    { id: 'presentation', title: 'Présenter', icon: Info, color: '#06B6D4', bg: '#ECFEFF', route: '/presentation' },
  ];

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prospects' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile with department and objectives
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userDept = profile?.department || 'brick_core';
      setUserData({ ...user, profile }); // Store profile in userData

      const { data, count, error } = await supabase
        .from('prospects')
        .select('*', { count: 'exact' })
        .eq('assigned_to', user.id)
        .eq('department', userDept);

      if (error) throw error;

      // Status logic for stats
      const salesCount = data?.filter((p: any) => 
        ['converted', 'Qualifié', 'won', 'vendu', 'success'].includes(p.status)
      ).length || 0;
      
      const inscriptionCount = data?.filter((p: any) => 
        !['new', 'nouveau', 'refused', 'lost'].includes(p.status?.toLowerCase())
      ).length || 0;

      const totalCommission = data?.reduce((acc: number, p: any) => acc + (p.commission_amount || 0), 0) || 0;
      
      // Objective logic
      const target = userDept === 'brick_food' ? (profile?.monthly_inscriptions_goal || 25) : (profile?.monthly_prospects_goal || 50);
      const currentProgress = userDept === 'brick_food' ? inscriptionCount : (count || 0);
      const objPercent = Math.min(Math.round((currentProgress / target) * 100), 100);

      setStats({
        prospects: count || 0,
        objective: objPercent,
        sales: salesCount,
        commission: totalCommission,
        inscriptions: inscriptionCount
      });
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.username}>
              {userData?.profile?.first_name || userData?.user_metadata?.full_name?.split(' ')[0] || 'Partenaire'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Bell size={20} color="#11181C" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Stats Summary Card */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/prospects' as any)}>
          <LinearGradient
            colors={['#4F46E5', '#312E81']} // Deep indigo gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroTitleContainer}>
                <Wallet color="rgba(255,255,255,0.8)" size={16} />
                <Text style={styles.heroTitle}>Performance du mois</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>En direct</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{stats.prospects}</Text>
                <Text style={styles.statLabel}>Prospects</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{isFood ? stats.inscriptions : stats.sales}</Text>
                <Text style={styles.statLabel}>{isFood ? 'Inscrits' : 'Ventes'}</Text>
              </View>
              {isFood && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statBlock}>
                    <Text style={styles.statNumber}>{stats.sales}</Text>
                    <Text style={styles.statLabel}>Abos</Text>
                  </View>
                </>
              )}
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={[styles.statNumber, { color: '#34D399' }]}>{stats.objective}%</Text>
                <Text style={styles.statLabel}>Objectif</Text>
              </View>
            </View>

            {isFood && stats.commission > 0 && (
              <View style={styles.commissionBadge}>
                <TrendingUp color="#34D399" size={14} />
                <Text style={styles.commissionText}>
                  {stats.commission.toLocaleString()} FCFA gagnés
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Primary Action Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.seactionHeader}>Action Rapide</Text>
        </View>

        {mainActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.mainActionBtn}
            activeOpacity={0.8}
            onPress={() => router.push(action.route as any)}
          >
            <View style={styles.mainActionFlex}>
              <View style={styles.mainActionIconWrapper}>
                <action.icon color="#11181C" size={24} />
              </View>
              <View style={styles.mainActionContent}>
                <Text style={styles.mainActionTitle}>{action.title}</Text>
                <Text style={styles.mainActionSubtitle}>{action.subtitle}</Text>
              </View>
              <View style={styles.mainActionArrowCircle}>
                <ChevronRight color="#64748B" size={18} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Resources Grid Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.seactionHeader}>Outils & Ressources</Text>
        </View>

        <View style={styles.gridContainer}>
          {resources.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.gridIcon, { backgroundColor: item.bg }]}>
                <item.icon color={item.color} size={24} />
              </View>
              <Text style={styles.gridLabel}>{item.title}</Text>
              <ChevronRight color="#CBD5E1" size={14} style={styles.gridArrow} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  headerLogo: {
    width: 80,
    height: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: 4,
  },
  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  commissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  commissionText: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '700',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.9,
  },
  heroBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)', // Emerald tint
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitleRow: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seactionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainActionBtn: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mainActionFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainActionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainActionContent: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainActionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  mainActionArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridItem: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  gridIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  gridArrow: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  tipCard: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  tipImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  tipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tipContent: {
    flex: 1,
    marginRight: 16,
  },
  tipBadge: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  tipBtn: {
    marginBottom: 4,
  }
});
