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
            <LinearGradient
                colors={['#FAF9F6', '#F2F0E6', '#E6E2D6']}
                start={{ x: 0.2, y: 0.1 }}
                end={{ x: 0.8, y: 0.9 }}
                style={styles.background}
            />

            {/* Geometric Shapes Background - Dark on Beige */}
            <Animated.View style={[styles.shape, styles.shape1, animatedShape1]} />
            <Animated.View style={[styles.shape, styles.shape2, animatedShape2]} />
            <View style={[styles.shape, styles.shape3]} />

            {/* Content */}
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                    <Text style={styles.logoText}>BRICK</Text>
                    <Text style={[styles.logoText, styles.logoHighlight]}>GO</Text>
                </Animated.View>

                <View style={styles.footer}>
                    <View style={styles.indicator} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F0E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
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
        fontSize: 42,
        fontWeight: '900',
        color: '#000000', // Black text
        letterSpacing: 1,
    },
    logoHighlight: {
        marginLeft: 8,
        color: '#000000',
        // Optional: add a border or different weight if needed, but BW contrast is enough
    },
    // Abstract Shapes
    shape: {
        position: 'absolute',
        borderRadius: 40,
        opacity: 0.03, // Very subtle dark shapes
    },
    shape1: {
        width: 300,
        height: 300,
        backgroundColor: '#000000',
        top: -50,
        right: -100,
        transform: [{ rotate: '45deg' }],
    },
    shape2: {
        width: 200,
        height: 200,
        backgroundColor: '#000000',
        bottom: 100,
        left: -50,
        borderRadius: 100,
    },
    shape3: {
        width: width * 0.8,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        bottom: height * 0.3,
        left: width * 0.1,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    indicator: {
        // Simple loading or decorative line
    }
});
