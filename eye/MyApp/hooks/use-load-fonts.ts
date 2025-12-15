
import { useFonts } from 'expo-font';

export const useLoadFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    'Cairo': require('../assets/fonts/Cairo-VariableFont_slnt,wght.ttf'),
  });

  return { fontsLoaded, fontError };
};
