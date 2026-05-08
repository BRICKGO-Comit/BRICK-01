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
    Alert,
    Image,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
    ArrowLeft, 
    Send, 
    User, 
    Building, 
    Phone, 
    MapPin, 
    Camera, 
    MessageCircle, 
    Utensils, 
    Clock, 
    CreditCard,
    CheckCircle2,
    XCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { OfflineManager } from '../../lib/offline';

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

const PhotoSelector = ({ label, photo, onSelect }: { label: string, photo: string | null, onSelect: () => void }) => (
    <TouchableOpacity style={styles.photoBox} onPress={onSelect}>
        {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
            <View style={styles.photoPlaceholder}>
                <Camera color="#64748B" size={24} />
                <Text style={styles.photoLabel}>{label}</Text>
            </View>
        )}
        {photo && (
            <View style={styles.photoBadge}>
                <CheckCircle2 color="#10B981" size={16} />
            </View>
        )}
    </TouchableOpacity>
);

export default function FoodNewProspectScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    const [formData, setFormData] = useState({
        establishmentName: '',
        managerName: '',
        phone: '',
        whatsapp: '',
        address: '',
        establishmentType: '',
        subscriptionPlan: '',
        comment: ''
    });

    const [photos, setPhotos] = useState<{ [key: string]: string | null }>({
        exterior: null,
        interior: null,
        menu: null,
        kitchen: null,
        terrace: null
    });

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationStatus('error');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
                setLocationStatus('success');
            } catch (error) {
                console.error('Location error:', error);
                setLocationStatus('error');
            }
        })();
    }, []);

    const pickImage = async (key: string) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotos(prev => ({ ...prev, [key]: result.assets[0].uri }));
        }
    };

    const uploadImage = async (uri: string, path: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileExt = uri.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('prospects')
            .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('prospects')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async () => {
        if (!formData.establishmentName || !formData.managerName || !formData.phone) {
            Alert.alert('Champs manquants', 'Veuillez renseigner le nom de l\'établissement, le gérant et le téléphone.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utilisateur non connecté');

            // Upload photos if any
            const uploadedUrls: any = {};
            for (const key of Object.keys(photos)) {
                if (photos[key]) {
                    uploadedUrls[key] = await uploadImage(photos[key]!, `prospects/${user.id}`);
                }
            }

            const payload = {
                company: formData.establishmentName,
                manager_name: formData.managerName,
                first_name: formData.managerName.split(' ')[0],
                last_name: formData.managerName.split(' ').slice(1).join(' ') || '.',
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                address: formData.address,
                establishment_type: formData.establishmentType,
                subscription_plan: formData.subscriptionPlan,
                comments: formData.comment,
                gps_latitude: coords?.lat,
                gps_longitude: coords?.lng,
                google_map_link: coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null,
                photo_exterior: uploadedUrls.exterior,
                photo_interior: uploadedUrls.interior,
                photo_menu: uploadedUrls.menu,
                photo_kitchen: uploadedUrls.kitchen,
                photo_terrace: uploadedUrls.terrace,
                department: 'brick_food',
                assigned_to: user.id,
                status: 'new'
            };

            const { error } = await supabase.from('prospects').insert(payload);
            if (error) throw error;

            Alert.alert('Succès', 'Établissement enregistré avec succès !', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error: any) {
            console.error('Submit error:', error);
            Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de l\'enregistrement.');
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
                <Text style={styles.headerTitle}>Brick Food Terrain</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.introSection}>
                        <Text style={styles.formTitle}>Nouvel Établissement</Text>
                        <Text style={styles.formSubtitle}>Enregistrez un restaurant ou commerce de bouche.</Text>
                        
                        <View style={styles.locationContainer}>
                            {locationStatus === 'loading' ? (
                                <View style={styles.locationBadgeLoading}>
                                    <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 8 }} />
                                    <Text style={styles.locationTextLoading}>Localisation...</Text>
                                </View>
                            ) : locationStatus === 'success' ? (
                                <View style={styles.locationBadgeSuccess}>
                                    <MapPin size={14} color="#059669" style={{ marginRight: 6 }} />
                                    <Text style={styles.locationTextSuccess}>Position GPS acquise</Text>
                                </View>
                            ) : (
                                <View style={styles.locationBadgeError}>
                                    <XCircle size={14} color="#EF4444" style={{ marginRight: 6 }} />
                                    <Text style={styles.locationTextError}>GPS indisponible</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Section 1: Infos Établissement */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Établissement</Text>
                        <InputField
                            label="Nom de l'établissement *"
                            icon={Building}
                            value={formData.establishmentName}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, establishmentName: t }))}
                            placeholder="Ex: Le Gourmet"
                        />
                        <InputField
                            label="Type d'établissement"
                            icon={Utensils}
                            value={formData.establishmentType}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, establishmentType: t }))}
                            placeholder="Restaurant, Fast-Food, Boulangerie..."
                        />
                        <InputField
                            label="Adresse"
                            icon={MapPin}
                            value={formData.address}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, address: t }))}
                            placeholder="Quartier, Rue..."
                        />
                    </View>

                    {/* Section 2: Contact Gérant */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Gérant</Text>
                        <InputField
                            label="Nom du gérant *"
                            icon={User}
                            value={formData.managerName}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, managerName: t }))}
                            placeholder="Nom et Prénom"
                        />
                        <InputField
                            label="Téléphone *"
                            icon={Phone}
                            value={formData.phone}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, phone: t }))}
                            placeholder="Ex: +225 00000000"
                            keyboardType="phone-pad"
                        />
                        <InputField
                            label="WhatsApp"
                            icon={MessageCircle}
                            value={formData.whatsapp}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, whatsapp: t }))}
                            placeholder="Numéro WhatsApp"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Section 3: Photos Terrain */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos Terrain</Text>
                        <View style={styles.photoGrid}>
                            <PhotoSelector label="Extérieur" photo={photos.exterior} onSelect={() => pickImage('exterior')} />
                            <PhotoSelector label="Intérieur" photo={photos.interior} onSelect={() => pickImage('interior')} />
                            <PhotoSelector label="Le Menu" photo={photos.menu} onSelect={() => pickImage('menu')} />
                            <PhotoSelector label="Cuisine" photo={photos.kitchen} onSelect={() => pickImage('kitchen')} />
                            <PhotoSelector label="Terrasse" photo={photos.terrace} onSelect={() => pickImage('terrace')} />
                        </View>
                    </View>

                    {/* Section 4: Offre */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Offre & Notes</Text>
                        <InputField
                            label="Formule suggérée"
                            icon={CreditCard}
                            value={formData.subscriptionPlan}
                            onChangeText={(t: string) => setFormData(p => ({ ...p, subscriptionPlan: t }))}
                            placeholder="3 mois, 6 mois, Annuel..."
                        />
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Commentaires / Observations</Text>
                            <TextInput
                                style={styles.textArea}
                                value={formData.comment}
                                onChangeText={(t) => setFormData(p => ({ ...p, comment: t }))}
                                placeholder="Notes sur la visite..."
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient colors={['#4F46E5', '#312E81']} style={styles.submitGradient}>
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Enregistrer l'Établissement</Text>
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
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 60 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#11181C', fontSize: 20, fontWeight: '700', marginLeft: 16 },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 40 },
    introSection: { marginBottom: 32 },
    formTitle: { color: '#11181C', fontSize: 28, fontWeight: '800' },
    formSubtitle: { color: '#64748B', fontSize: 16, marginTop: 4 },
    locationContainer: { marginTop: 16, flexDirection: 'row' },
    locationBadgeLoading: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 8, borderRadius: 12 },
    locationBadgeSuccess: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 8, borderRadius: 12 },
    locationBadgeError: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 12 },
    locationTextLoading: { fontSize: 13, color: '#6366F1', fontWeight: '600' },
    locationTextSuccess: { fontSize: 13, color: '#059669', fontWeight: '600' },
    locationTextError: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#4F46E5', paddingLeft: 12 },
    inputSection: { marginBottom: 20 },
    label: { color: '#11181C', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, height: 56 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#11181C', fontSize: 16 },
    textArea: { backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, height: 120, textAlignVertical: 'top', color: '#11181C', fontSize: 16 },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    photoBox: { width: '30%', aspectRatio: 1, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    photoPlaceholder: { alignItems: 'center', padding: 8 },
    photoLabel: { fontSize: 10, color: '#64748B', marginTop: 4, fontWeight: '600', textAlign: 'center' },
    photoPreview: { width: '100%', height: '100%', borderRadius: 16 },
    photoBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 2 },
    submitBtn: { marginTop: 12, borderRadius: 20, overflow: 'hidden' },
    submitGradient: { height: 64, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    submitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    submitBtnDisabled: { opacity: 0.7 }
});
