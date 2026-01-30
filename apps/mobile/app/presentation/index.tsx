import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap, Globe, Target, Layers, Briefcase, GraduationCap, DollarSign, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PresentationScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Fixed Background */}
            <View style={[styles.fixedBackground, { backgroundColor: '#11181C' }]} />
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.fixedOverlay}
            />

            {/* Back Button (Fixed) */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <ArrowLeft color="#11181C" size={24} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Spacer to push content down so image is visible */}
                <View style={styles.headerSpacer} />

                {/* Hero Text (Scrolls with content) */}
                <View style={styles.heroTextContainer}>
                    <Text style={styles.heroPreTitle}>PRÉSENTATION GÉNÉRALE</Text>
                    <Text style={styles.heroTitle}>BRICK</Text>
                    <Text style={styles.heroSubtitle}>Communication & Création Digitale</Text>
                </View>

                {/* Main Content (White Card) */}
                <View style={styles.content}>
                    {/* 1. Présentation BRICK */}
                    <View style={styles.section}>
                        <Text style={styles.introText}>
                            <Text style={styles.bold}>BRICK</Text> est une structure de communication et de création digitale dédiée à l’accompagnement des entreprises, marques, entrepreneurs et institutions dans la construction, la gestion et la valorisation de leur image.
                        </Text>
                        <Text style={styles.paragraph}>
                            Nous concevons des stratégies de communication modernes, adaptées aux réalités africaines, en mettant le digital, le contenu et la visibilité au cœur de la performance.
                        </Text>

                        <View style={styles.highlightBox}>
                            <View style={styles.row}>
                                <Target color="#4F46E5" size={20} style={{ marginTop: 2 }} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.highlightTitle}>Mission</Text>
                                    <Text style={styles.highlightText}>Construire des marques fortes, visibles et crédibles grâce à une communication moderne et orientée résultats.</Text>
                                </View>
                            </View>
                            <View style={[styles.row, { marginTop: 15 }]}>
                                <Globe color="#10B981" size={20} style={{ marginTop: 2 }} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.highlightTitle}>Vision</Text>
                                    <Text style={styles.highlightText}>Devenir une référence en communication digitale et création de contenu en Afrique francophone.</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 2. Organisation */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>ORGANISATION INTERNE</Text>
                        <Text style={styles.paragraph}>
                            Pour répondre efficacement aux besoins du marché, BRICK s’organise en départements spécialisés.
                        </Text>
                        <View style={styles.deptCard}>
                            <Briefcase color="#FFF" size={24} />
                            <Text style={styles.deptTitle}>BRICK GO</Text>
                            <Text style={styles.deptDesc}>Le département commercial, digital et performance.</Text>
                        </View>
                    </View>

                    {/* 3. Présentation BRICK GO */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>BRICK GO</Text>
                        <Text style={styles.subHeader}>Département Commercial & Opérationnel</Text>
                        <Text style={styles.paragraph}>
                            Spécialisé en communication digitale, marketing de vente et formation professionnelle. Si BRICK construit l’image, <Text style={styles.bold}>Brick Go la fait vendre.</Text>
                        </Text>

                        <View style={styles.bulletList}>
                            <BulletPoint text="Assurer la gestion commerciale digitale" />
                            <BulletPoint text="Développer la visibilité rentable" />
                            <BulletPoint text="Générer des ventes, prospects et clients" />
                            <BulletPoint text="Former les équipes internes" />
                        </View>
                    </View>

                    {/* 4. Formations */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <GraduationCap color="#EC4899" size={24} />
                            <Text style={[styles.sectionHeader, { marginBottom: 0, marginLeft: 10 }]}>FORMATIONS</Text>
                        </View>
                        <Text style={[styles.paragraph, { marginTop: 10 }]}>
                            Des formations pratiques, professionnelles et orientées résultats.
                        </Text>

                        <FormationItem title="Réseaux Sociaux & Vente Digitale" details={["Facebook, Instagram, TikTok", "Contenus qui vendent", "Conversion abonnés -> clients"]} />
                        <FormationItem title="Publicité Digitale & Sponsoring" details={["Campagnes sponsorisées (Ads)", "Ciblage précis", "Gestion budget & ROI"]} />
                        <FormationItem title="Création de Contenus" details={["Design Canva Professionnel", "Montage Vidéo CapCut", "Valorisation produits"]} />
                        <FormationItem title="Gestion Client & Bases de Données" details={["Suivi contacts & CRM", "Techniques de relance", "Fidélisation"]} />
                        <FormationItem title="Formation Interne Entreprise" details={["Organisation du travail digital", "Stratégie interne", "Performance d'équipe"]} />
                    </View>

                    {/* 5. Services */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Layers color="#F59E0B" size={24} />
                            <Text style={[styles.sectionHeader, { marginBottom: 0, marginLeft: 10 }]}>SERVICES</Text>
                        </View>
                        <View style={styles.serviceGrid}>
                            <Text style={styles.serviceItem}>✅ Gestion Complète Comm. Digitale</Text>
                            <Text style={styles.serviceItem}>✅ Création de Contenus (Photo/Vidéo)</Text>
                            <Text style={styles.serviceItem}>✅ Publicité & Sponsoring</Text>
                            <Text style={styles.serviceItem}>✅ Organisation de Lives</Text>
                            <Text style={styles.serviceItem}>✅ Production Spots Publicitaires</Text>
                        </View>
                    </View>

                    {/* 6. Packages */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <DollarSign color="#10B981" size={24} />
                            <Text style={[styles.sectionHeader, { marginBottom: 0, marginLeft: 10 }]}>NOS PACKAGES (Mensuel)</Text>
                        </View>
                        <View style={styles.pricingContainer}>
                            <PricingCard price="50 000" features="Gestion de base + Visibilité" color="#94A3B8" />
                            <PricingCard price="75 000" features="Visibilité + Sponsoring" color="#60A5FA" />
                            <PricingCard price="100 000" features="Gestion complète + Stratégie" color="#818CF8" popular />
                            <PricingCard price="150 000" features="Premium + Formation + Lives" color="#F472B6" />
                        </View>
                        <Text style={styles.pricingNote}>* Offres flexibles et personnalisables.</Text>
                    </View>

                    {/* 7. Valeur Ajoutée */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>POURQUOI NOUS ?</Text>
                        <View style={styles.valueList}>
                            <ValueItem icon={ShieldCheck} text="Structure claire et professionnelle" />
                            <ValueItem icon={Target} text="Séparation Image vs Performance" />
                            <ValueItem icon={Zap} text="Approche orientée résultats & ventes" />
                            <ValueItem icon={Globe} text="Expertise locale (Marché Africain)" />
                        </View>
                    </View>

                    {/* Conclusion */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            BRICK pense et structure.{"\n"}
                            Brick Go active et vend.
                        </Text>
                        <LinearGradient colors={['#4F46E5', '#9333EA']} style={styles.footerSloganBox}>
                            <Text style={styles.footerSlogan}>
                                ENSEMBLE :{"\n"}IMAGE + VISIBILITÉ + VENTES
                            </Text>
                        </LinearGradient>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

// Components Helpers
const BulletPoint = ({ text }: { text: string }) => (
    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4F46E5', marginTop: 8, marginRight: 10 }} />
        <Text style={{ color: '#4B5563', fontSize: 15, lineHeight: 22, flex: 1 }}>{text}</Text>
    </View>
);

const FormationItem = ({ title, details }: { title: string, details: string[] }) => (
    <View style={styles.formationCard}>
        <Text style={styles.formationTitle}>{title}</Text>
        <Text style={styles.formationDetails}>{details.join(" • ")}</Text>
    </View>
);

const PricingCard = ({ price, features, color, popular }: { price: string, features: string, color: string, popular?: boolean }) => (
    <View style={[styles.pricingCard, popular && styles.popularPricing]}>
        <View style={[styles.priceTag, { backgroundColor: color }]}>
            <Text style={styles.priceText}>{price} F</Text>
        </View>
        <Text style={styles.priceFeatures}>{features}</Text>
        {popular && <View style={styles.popularBadge}><Text style={styles.popularText}>Populaire</Text></View>}
    </View>
);

const ValueItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <View style={styles.valueItem}>
        <Icon color="#4F46E5" size={20} />
        <Text style={styles.valueText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    fixedBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 600, // Tall enough to cover bounce
        width: '100%',
        resizeMode: 'cover',
    },
    fixedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 600,
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerSpacer: {
        height: 220,
    },
    heroTextContainer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    heroPreTitle: {
        color: '#FCD34D',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
        lineHeight: 42,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    heroSubtitle: {
        color: '#E2E8F0',
        fontSize: 16,
        fontWeight: '600',
        flexWrap: 'wrap',
        marginBottom: 10,
        lineHeight: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    content: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        minHeight: 800,
    },
    section: {
        marginBottom: 40,
    },
    introText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#1F2937',
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4B5563',
        marginBottom: 16,
    },
    bold: {
        fontWeight: '700',
        color: '#11181C',
    },
    highlightBox: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4F46E5',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    highlightTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#11181C',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    highlightText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#475569',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '800',
        color: '#11181C',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4F46E5',
        marginBottom: 12,
    },
    deptCard: {
        backgroundColor: '#11181C',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    deptTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        marginTop: 10,
    },
    deptDesc: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
    },
    bulletList: {
        marginTop: 10,
        paddingLeft: 5,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    formationCard: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    formationTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    formationDetails: {
        fontSize: 13,
        color: '#6B7280',
    },
    serviceGrid: {
        gap: 12,
    },
    serviceItem: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        overflow: 'hidden',
    },
    pricingContainer: {
        gap: 12,
        marginTop: 10,
    },
    pricingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    popularPricing: {
        borderColor: '#818CF8',
        backgroundColor: '#EEF2FF',
        borderWidth: 2,
    },
    priceTag: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginRight: 12,
        minWidth: 90,
        alignItems: 'center',
    },
    priceText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    priceFeatures: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        right: 10,
        backgroundColor: '#818CF8',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    popularText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    pricingNote: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    valueList: {
        gap: 12,
    },
    valueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
    },
    valueText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerText: {
        fontSize: 16,
        color: '#11181C',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    footerSloganBox: {
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    footerSlogan: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        lineHeight: 24,
    },
});
