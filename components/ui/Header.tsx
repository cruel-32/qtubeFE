import { LogoIcon } from '@/components/icons';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Header = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogoPress = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card, borderBottomColor: colors.border }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.logoContainer} onPress={handleLogoPress}>
          <LogoIcon width={32} height={32} />
          <Text style={[styles.logoText, { color: colors.primary }]}>tube</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    // fontSize: screenWidth < 380 ? 24 : 28,
    fontSize: 28,
    fontWeight: '400',
    color: '#2563EB',
    marginLeft: 4,
  },
}); 