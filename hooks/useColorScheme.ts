import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
    return (useRNColorScheme() ?? 'light') as 'light' | 'dark';
}
