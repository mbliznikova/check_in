import { Mixpanel } from 'mixpanel-react-native';

const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? '';

const trackAutomaticEvents = true;

export const mixpanel = new Mixpanel(token || 'noop', trackAutomaticEvents);

if (token) {
  mixpanel.init();
} else {
  console.warn('[Mixpanel] EXPO_PUBLIC_MIXPANEL_TOKEN is not set — tracking disabled.');
}
