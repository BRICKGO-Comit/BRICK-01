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
    FlatList,
    Platform,
    Linking,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Play, Filter, PlayCircle, Loader2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function VideosScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Tous');
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const handlePlayVideo = async (url: string) => {
        if (!url) {
            Alert.alert('Erreur', 'Aucun lien disponible pour cette vidéo.');
            return;
        }

        try {
            // First try with Linking (might open YouTube/Drive app)
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // If not "supported" by a specific app, try opening in the browser
                await WebBrowser.openBrowserAsync(url);
            }
        } catch (error) {
            console.error('Error opening URL:', error);
            // Fallback to WebBrowser if Linking throws
            try {
                await WebBrowser.openBrowserAsync(url);
            } catch (innerError) {
                Alert.alert('Erreur', "Impossible d'ouvrir la vidéo.");
            }
        }
    };

    const fetchVideos = async () => {
        try {
            const { data, error } = await supabase
                .from('contents')
                .select('*')
                .eq('type', 'video');

            if (error) throw error;
            setVideos(data || []);
        } catch (err) {
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Tous', 'Corporate', 'Services', 'Témoignages', 'Ads'];

    const filteredVideos = activeTab === 'Tous'
        ? videos
        : videos.filter(v => (v.category || 'Corporate') === activeTab);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#11181C" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vidéos Commerciales</Text>
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveTab(cat)}
                            style={[
                                styles.tabField,
                                activeTab === cat && styles.tabFieldActive
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === cat && styles.tabTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Loader2 color="#F59E0B" size={40} />
                    <Text style={styles.loadingText}>Chargement des vidéos...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredVideos}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.videoCard}
                            activeOpacity={0.9}
                            onPress={() => handlePlayVideo(item.url)}
                        >
                            <View style={styles.thumbContainer}>
                                <Image
                                    source={{ uri: item.thumbnail_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400' }}
                                    style={styles.thumb}
                                />
                                <View style={styles.playOverlay}>
                                    <View style={styles.playIconContainer}>
                                        <Play color="#FFF" size={24} fill="#FFF" />
                                    </View>
                                </View>
                                {item.duration && (
                                    <View style={styles.durationBadge}>
                                        <Text style={styles.durationText}>{item.duration}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.videoInfo}>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryBadgeText}>{item.category || 'Corporate'}</Text>
                                </View>
                                <Text style={styles.videoTitle}>{item.title}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
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
    tabsContainer: {
        marginBottom: 20,
    },
    tabsScroll: {
        paddingHorizontal: 20,
    },
    tabField: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: '#F4F4F5',
        borderWidth: 1,
        borderColor: '#E4E4E7',
    },
    tabFieldActive: {
        backgroundColor: '#F59E0B20',
        borderColor: '#F59E0B',
    },
    tabText: {
        color: '#9BA1A6',
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#F59E0B',
    },
    listContent: {
        padding: 20,
    },
    videoCard: {
        backgroundColor: '#F4F4F5',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    thumbContainer: {
        height: 180,
        width: '100%',
        position: 'relative',
    },
    thumb: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 4,
    },
    durationBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    durationText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    videoInfo: {
        padding: 15,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 6,
    },
    categoryBadgeText: {
        color: '#11181C',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    videoTitle: {
        color: '#11181C',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#9BA1A6',
        fontSize: 16,
    }
});
