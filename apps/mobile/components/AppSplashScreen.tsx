import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function AppSplashScreen() {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const shape1Y = useSharedValue(0);
    const shape2Y = useSharedValue(0);

    useEffect(() => {
        // Logo Animation
        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });

        // Background Shapes Floating
        shape1Y.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ), -1, true
        );
        shape2Y.value = withDelay(1000, withRepeat(
            withSequence(
                withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ), -1, true
        ));
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    const animatedShape1 = useAnimatedStyle(() => ({
        transform: [{ translateY: shape1Y.value }]
    }));

    const animatedShape2 = useAnimatedStyle(() => ({
        transform: [{ translateY: shape2Y.value }]
    }));

    return (
        <View style={styles.container}>
            {/* Beige Background */}
            <View style={styles.background} />

            {/* Content */}
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                    <Text style={styles.logoText}>BRICK</Text>
                    <Text style={[styles.logoText, styles.logoHighlight]}>GO</Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC', // Beige couleur
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F5F5DC',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
        textTransform: 'uppercase',
    },
    logoHighlight: {
        marginLeft: 12,
        color: '#000000',
    },
});
