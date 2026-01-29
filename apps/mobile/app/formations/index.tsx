import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, GraduationCap, Clock, Euro, CheckCircle, ChevronRight, Loader2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function FormationsScreen() {
    const router = useRouter();
    const [formations, setFormations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFormations();

        const channel = supabase
            .channel('formations-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'contents' },
                () => fetchFormations()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchFormations = async () => {
        try {
            const { data, error } = await supabase
                .from('contents')
                .select('*')
                .eq('type', 'formation');

            if (error) throw error;
            setFormations(data || []);
        } catch (err) {
            console.error('Error fetching formations:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#11181C" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Formations</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.promoCard}>
                    <LinearGradient
                        colors={['#EC4899', '#9333EA']}
                        style={styles.promoGradient}
                    >
                        <View style={styles.promoTextContainer}>
                            <Text style={styles.promoTitle}>Booster vos {"\n"}compétences</Text>
                            <Text style={styles.promoSubtitle}>Évoluez avec l'Academy BRICK</Text>
                        </View>
                        <View style={styles.promoIcon}>
                            <GraduationCap color="#FFF" size={64} opacity={0.3} />
                        </View>
                    </LinearGradient>
                </View>

                <Text style={styles.sectionTitle}>Formations disponibles</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Loader2 color="#9333EA" size={40} />
                        <Text style={styles.loadingText}>Ouverture de l'Academy...</Text>
                    </View>
                ) : formations.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.formationCard} activeOpacity={0.9}>
                        <View style={styles.cardTop}>
                            <View style={styles.titleRow}>
                                <Text style={styles.formationTitle}>{item.title}</Text>
                                <Text style={styles.priceTag}>{item.price ? `${item.price}€` : 'Gratuit'}</Text>
                            </View>
                            <Text style={styles.formationDesc}>{item.description}</Text>

                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Clock color="#9BA1A6" size={14} />
                                    <Text style={styles.detailText}>{item.duration || 'Flexible'}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Euro color="#9BA1A6" size={14} />
                                    <Text style={styles.detailText}>Eligible CPF</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.moduleList}>
                            {(item.modules || ['Introduction', 'Pratique']).slice(0, 2).map((mod: string, i: number) => (
                                <View key={i} style={styles.moduleItem}>
                                    <CheckCircle color="#10B981" size={14} />
                                    <Text style={styles.moduleText}>{mod}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.registerBtn}
                            onPress={() => router.push('/prospect/new')}
                        >
                            <Text style={styles.registerBtnText}>S'inscrire à la formation</Text>
                            <ChevronRight color="#FFF" size={18} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
                {!loading && formations.length === 0 && (
                    <Text style={styles.emptyText}>Aucune formation disponible pour le moment.</Text>
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
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 50,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F4F4F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#11181C',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 15,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    promoCard: {
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 30,
    },
    promoGradient: {
        flex: 1,
        flexDirection: 'row',
        padding: 25,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    promoTextContainer: {
        flex: 1,
    },
    promoTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 30,
    },
    promoSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    promoIcon: {
        marginLeft: 20,
    },
    sectionTitle: {
        color: '#11181C',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    formationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    cardTop: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F4F5',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    formationTitle: {
        color: '#11181C',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        marginRight: 10,
    },
    priceTag: {
        color: '#EC4899',
        fontSize: 18,
        fontWeight: '800',
    },
    formationDesc: {
        color: '#3F3F46', // Darker gray for better readability
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 15,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        color: '#3F3F46', // Darker text
        fontSize: 12,
        fontWeight: '600',
    },
    moduleList: {
        padding: 15,
        backgroundColor: '#F8FAFC', // Slightly different shade
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    moduleText: {
        color: '#3F3F46', // Darker text
        fontSize: 12,
        fontWeight: '500',
    },
    registerBtn: {
        backgroundColor: '#EC4899',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        gap: 8,
    },
    registerBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748B',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#64748B',
    }
});
