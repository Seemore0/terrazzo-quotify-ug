import { Capacitor } from '@capacitor/core';

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();
export const isAndroid = (): boolean => isNativeApp() && Capacitor.getPlatform() === 'android';
export const isWeb = (): boolean => !isNativeApp();
