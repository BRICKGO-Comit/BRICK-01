import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Eye,
    ShoppingBag,
    Video,
    Users,
    GraduationCap,
    ChevronRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function QuizScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);

    const choices = [
        { id: 'visibility', title: 'Plus de visibilité', icon: Eye, color: '#4F46E5' },
        { id: 'sales', title: 'Vendre des produits', icon: ShoppingBag, color: '#10B981' },
        { id: 'video', title: 'Vidéo / publicité', icon: Video, color: '#F59E0B' },
        { id: 'social', title: 'Réseaux sociaux', icon: Users, color: '#06B6D4' },
        { id: 'training', title: 'Formation', icon: GraduationCap, color: '#EC4899' },
    ];

    const handleSelect = (id: string) => {
        setSelected(id);
        // Simulating delay for effect before navigating
        setTimeout(() => {
            router.push({
                pathname: '/(tabs)/services',
                params: { filter: id }
            } as any);
        }, 400);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#11181C" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Identification</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={['#4F46E5', '#9333EA']}
                            style={styles.progressFill}
                        />
                    </View>
                    <Text style={styles.progressText}>Question 1 / 1</Text>
                </View>

                <Text style={styles.question}>Quel est votre besoin principal ?</Text>
                <Text style={styles.subtitle}>Sélectionnez l'option qui correspond le mieux à l'objectif du client.</Text>

                <View style={styles.choicesContainer}>
                    {choices.map((choice) => (
                        <TouchableOpacity
                            key={choice.id}
                            activeOpacity={0.7}
                            onPress={() => handleSelect(choice.id)}
                            style={[
                                styles.choiceItem,
                                selected === choice.id && { borderColor: choice.color, backgroundColor: `${choice.color}15` }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${choice.color}20` }]}>
                                <choice.icon color={choice.color} size={24} />
                            </View>
                            <Text style={styles.choiceTitle}>{choice.title}</Text>
                            <ChevronRight color={selected === choice.id ? choice.color : "#27272A"} size={20} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    progressContainer: {
        marginBottom: 30,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F4F4F5',
        borderRadius: 3,
        width: '100%',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        width: '100%',
        borderRadius: 3,
    },
    progressText: {
        color: '#9BA1A6',
        fontSize: 12,
        fontWeight: '600',
    },
    question: {
        color: '#11181C',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    subtitle: {
        color: '#9BA1A6',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 40,
    },
    choicesContainer: {
        flex: 1,
    },
    choiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F5',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    choiceTitle: {
        flex: 1,
        color: '#11181C',
        fontSize: 16,
        fontWeight: '600',
    }
});
