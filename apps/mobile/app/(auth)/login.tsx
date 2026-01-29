import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    StatusBar,
    Animated,
    Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        // Initial Entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Continuous Pulse Animation after entrance
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 1500,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.sin)
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.sin)
                    })
                ])
            ).start();
        });
    }, []);

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message);
            } else {
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error(err);
            alert('Une erreur est survenue lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Background Graphic elements */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <Image
                            source={require('../../assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Connectez-vous à votre espace</Text>

                        <BlurView intensity={20} tint="light" style={styles.inputWrapper}>
                            <Mail color="#64748B" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="gobrick638@gmail.com"
                                placeholderTextColor="#9BA1A6"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </BlurView>

                        <BlurView intensity={20} tint="light" style={styles.inputWrapper}>
                            <Lock color="#64748B" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                placeholderTextColor="#9BA1A6"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                {showPassword ? <EyeOff color="#64748B" size={20} /> : <Eye color="#64748B" size={20} />}
                            </TouchableOpacity>
                        </BlurView>

                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
                            <LinearGradient
                                colors={['#2563EB', '#1D4ED8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                            >
                                {loading ? (
                                    <Loader2 color="#FFFFFF" size={24} style={styles.loadingIcon} />
                                ) : (
                                    <Text style={styles.loginBtnText}>Se Connecter</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC', // Beige
    },
    keyboardView: {
        flex: 1,
    },
    bgCircle1: {
        position: 'absolute',
        top: -height * 0.1,
        right: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
    },
    bgCircle2: {
        position: 'absolute',
        bottom: height * 0.1,
        left: -width * 0.3,
        width: width,
        height: width,
        borderRadius: width * 0.5,
        backgroundColor: 'rgba(147, 51, 234, 0.05)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        width: 200,
        height: 100,
    },
    brandTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900',
        marginTop: 0, // Reset margin since it is inside a padded container now
        letterSpacing: 1,
        // Removed italic to match the reference image which is upright
    },
    formContainer: {
        width: '100%',
    },
    welcomeText: {
        color: '#1C1C1E',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.7,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 60,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#1C1C1E',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
    loginBtn: {
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    loginBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    loginBtnDisabled: {
        opacity: 0.7,
    },
    loadingIcon: {
        alignSelf: 'center',
    }
});
