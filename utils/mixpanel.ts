import { Mixpanel } from 'mixpanel-react-native';

const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!;
const trackAutomaticEvents = true;

export const mixpanel = new Mixpanel(token, trackAutomaticEvents);
mixpanel.init();
