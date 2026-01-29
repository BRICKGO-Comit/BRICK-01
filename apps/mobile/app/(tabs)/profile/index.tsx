import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    User,
    Mail,
    Phone,
    LogOut,
    ChevronRight,
    Shield,
    Bell,
    Lock
} from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            if (data) setProfile(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Déconnexion",
                    style: "destructive",
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mon Profil</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Utilisateur'}
                        </Text>
                        <Text style={styles.profileRole}>Commercial BRICK</Text>
                    </View>
                </View>

                {/* Personal Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Mail color="#4F46E5" size={20} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Phone color="#4F46E5" size={20} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Téléphone</Text>
                            <Text style={styles.infoValue}>{profile?.phone || 'Non renseigné'}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>

                    <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Bientôt disponible', 'La gestion des notifications sera bientôt disponible.')}>
                        <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                            <Bell color="#9333EA" size={20} />
                        </View>
                        <Text style={styles.settinglabel}>Notifications</Text>
                        <ChevronRight color="#9BA1A6" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert(
                            'Politique de confidentialité',
                            "Chez BRICK GO, la confidentialité de vos données est notre priorité. \n\n" +
                            "Nous collectons uniquement les informations nécessaires au bon fonctionnement de l'application et à l'amélioration de nos services. \n\n" +
                            "Vos données personnelles (nom, email, téléphone, activité) sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement explicite, sauf obligation légale.\n\n" +
                            "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour toute demande, veuillez contacter le support admin."
                        )}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                            <Shield color="#10B981" size={20} />
                        </View>
                        <Text style={styles.settinglabel}>Confidentialité</Text>
                        <ChevronRight color="#9BA1A6" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Bientôt disponible', 'La modification du mot de passe sera bientôt disponible.')}>
                        <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                            <Lock color="#3B82F6" size={20} />
                        </View>
                        <Text style={styles.settinglabel}>Mot de passe</Text>
                        <ChevronRight color="#9BA1A6" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                    <LogOut color="#EF4444" size={20} />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#11181C',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC', // Slate 50
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#11181C',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#11181C',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    settinglabel: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
    },
    versionText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
    }
});
