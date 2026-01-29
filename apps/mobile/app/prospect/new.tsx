import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, User, Building, Phone, Mail, MessageSquare, Briefcase, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react-native';
import * as Location from 'expo-location';

// Move InputField OUTSIDE the component to prevent re-renders on every keystroke
const InputField = ({ label, icon: Icon, value, onChangeText, placeholder, ...props }: any) => (
    <View style={styles.inputSection}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Icon color="#4F46E5" size={20} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                {...props}
            />
        </View>
    </View>
);

export default function NewProspectScreen() {
    const router = useRouter();
    const searchParams = useLocalSearchParams();
    const initialService = searchParams.service as string;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        email: '',
        address: '',
        need: initialService || '',
        comment: ''
    });

    const [locationLink, setLocationLink] = useState<string | null>(null);
    const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        (async () => {
            try {
                // Request permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    setLocationStatus('error');
                    return;
                }

                // Get current location
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const link = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;

                setLocationLink(link);
                setLocationStatus('success');
            } catch (error) {
                console.error('Error getting location:', error);
                setLocationStatus('error');
            }
        })();
    }, []);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.phone) {
            Alert.alert('Champs manquants', 'Veuillez renseigner le Prénom, le Nom et le Téléphone.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Erreur', 'Vous devez être connecté pour enregistrer un prospect.');
                return;
            }

            const { error } = await supabase
                .from('prospects')
                .insert({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    company: formData.company,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    need: formData.need,
                    assigned_to: user.id,
                    status: 'new',
                    comments: formData.comment,
                    google_map_link: locationLink // Add the link here
                });

            if (error) throw error;

            Alert.alert(
                'Succès',
                'Prospect enregistré avec succès !',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
            );
        } catch (err: any) {
            console.error(err);
            let message = err.message || 'Erreur inconnue';
            if (message.includes('column') || message.includes('exist') || message.includes('google_map_link')) {
                message = "La base de données doit être mise à jour. Veuillez exécuter le script 'fix_prospects_db_location.sql' dans Supabase.";
            }
            Alert.alert('Erreur', message);
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
                <Text style={styles.headerTitle}>Nouveau Prospect</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.formTitle}>Informations du client</Text>
                    <View style={styles.locationContainer}>
                        {locationStatus === 'loading' && (
                            <View style={styles.locationBadgeLoading}>
                                <Loader2 size={12} color="#6366F1" style={{ marginRight: 6 }} />
                                <Text style={styles.locationTextLoading}>Localisation en cours...</Text>
                            </View>
                        )}
                        {locationStatus === 'success' && (
                            <View style={styles.locationBadgeSuccess}>
                                <MapPin size={12} color="#059669" style={{ marginRight: 6 }} />
                                <Text style={styles.locationTextSuccess}>Position sécurisée</Text>
                            </View>
                        )}
                        {locationStatus === 'error' && (
                            <View style={styles.locationBadgeError}>
                                <MapPin size={12} color="#EF4444" style={{ marginRight: 6 }} />
                                <Text style={styles.locationTextError}>Localisation impossible</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.formSubtitle}>Saisissez les informations du prospect pour le suivi commercial.</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputSection, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Prénom *</Text>
                            <View style={styles.inputWrapper}>
                                <User color="#4F46E5" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.firstName}
                                    onChangeText={(t) => setFormData(prev => ({ ...prev, firstName: t }))}
                                    placeholder="Prénom"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>
                        <View style={[styles.inputSection, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Nom *</Text>
                            <View style={styles.inputWrapper}>
                                <User color="#4F46E5" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.lastName}
                                    onChangeText={(t) => setFormData(prev => ({ ...prev, lastName: t }))}
                                    placeholder="Nom"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>
                    </View>

                    <InputField
                        label="Entreprise"
                        icon={Building}
                        value={formData.company}
                        onChangeText={(t: string) => setFormData(prev => ({ ...prev, company: t }))}
                        placeholder="Nom de la société (Optionnelle)"
                    />

                    <InputField
                        label="Adresse / Localisation"
                        icon={Building}
                        value={formData.address}
                        onChangeText={(t: string) => setFormData(prev => ({ ...prev, address: t }))}
                        placeholder="Ex: Mermoz, Dakar"
                    />

                    <InputField
                        label="Téléphone *"
                        icon={Phone}
                        value={formData.phone}
                        onChangeText={(t: string) => setFormData(prev => ({ ...prev, phone: t }))}
                        placeholder="Ex: +221 77 000 00 00"
                        keyboardType="phone-pad"
                    />

                    <InputField
                        label="Email"
                        icon={Mail}
                        value={formData.email}
                        onChangeText={(t: string) => setFormData(prev => ({ ...prev, email: t }))}
                        placeholder="prospect@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <InputField
                        label="Service / Besoin"
                        icon={Briefcase}
                        value={formData.need}
                        onChangeText={(t: string) => setFormData(prev => ({ ...prev, need: t }))}
                        placeholder="Quel est le besoin ?"
                    />

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Commentaires</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <MessageSquare color="#4F46E5" size={20} style={[styles.inputIcon, { marginTop: 12 }]} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.comment}
                                onChangeText={(t: string) => setFormData(prev => ({ ...prev, comment: t }))}
                                placeholder="Notes complémentaires..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.submitGradient}
                        >
                            {loading ? (
                                <Loader2 color="#FFF" size={24} />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Enregistrer le Prospect</Text>
                                    <Send color="#FFF" size={20} style={{ marginLeft: 10 }} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 60,
        backgroundColor: '#FFFFFF',
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
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 16,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    formTitle: {
        color: '#11181C',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    formSubtitle: {
        color: '#64748B',
        fontSize: 14,
        marginBottom: 32,
        lineHeight: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        color: '#11181C',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#11181C',
        fontSize: 16,
    },
    textAreaWrapper: {
        height: 120,
        alignItems: 'flex-start',
    },
    textArea: {
        height: '100%',
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    locationContainer: {
        marginBottom: 8,
        flexDirection: 'row',
    },
    locationBadgeLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    locationTextLoading: {
        fontSize: 12,
        color: '#6366F1',
        fontWeight: '600',
    },
    locationBadgeSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    locationTextSuccess: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },
    locationBadgeError: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    locationTextError: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
    },
    submitBtn: {
        marginTop: 12,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
    },
    submitGradient: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    submitBtnDisabled: {
        opacity: 0.7,
    }
});
