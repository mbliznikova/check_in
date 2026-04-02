import { useColorScheme } from '@/hooks/useColorScheme';

const textStyles = {
    dark:  { color: '#fff' },
    light: { color: '#000' },
} as const;

export function useThemeTextStyle() {
    const colorScheme = useColorScheme() ?? 'light';
    return textStyles[colorScheme];
}
