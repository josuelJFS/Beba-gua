import { AdMobBanner, AdMobInterstitial, setTestDeviceIDAsync } from "expo-ads-admob";
import { ADMOB_CONFIG } from "../config/constants";

class AdMobService {
  private interstitialLoaded = false;

  async initialize(): Promise<void> {
    try {
      if (__DEV__) {
        // Use test device ID in development
        await setTestDeviceIDAsync("EMULATOR");
      }
    } catch (error) {
      console.error("Error initializing AdMob:", error);
    }
  }

  async loadInterstitial(): Promise<void> {
    try {
      await AdMobInterstitial.setAdUnitID(ADMOB_CONFIG.INTERSTITIAL_ID);

      AdMobInterstitial.addEventListener("interstitialDidLoad", () => {
        this.interstitialLoaded = true;
      });

      AdMobInterstitial.addEventListener("interstitialDidFailToLoad", () => {
        this.interstitialLoaded = false;
      });

      AdMobInterstitial.addEventListener("interstitialDidClose", () => {
        this.interstitialLoaded = false;
        // Preload the next interstitial
        this.preloadInterstitial();
      });

      await this.preloadInterstitial();
    } catch (error) {
      console.error("Error loading interstitial:", error);
    }
  }

  async preloadInterstitial(): Promise<void> {
    try {
      await AdMobInterstitial.requestAdAsync();
    } catch (error) {
      console.error("Error preloading interstitial:", error);
    }
  }

  async showGoalAchievedAd(): Promise<void> {
    try {
      if (this.interstitialLoaded) {
        await AdMobInterstitial.showAdAsync();
      } else {
        console.log("Interstitial ad not loaded yet");
      }
    } catch (error) {
      console.error("Error showing interstitial ad:", error);
    }
  }

  getBannerComponent() {
    return AdMobBanner;
  }

  getBannerId(): string {
    return ADMOB_CONFIG.BANNER_ID;
  }
}

export const adMobService = new AdMobService();
