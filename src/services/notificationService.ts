import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("water-reminders", {
          name: "Lembretes de Água",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#00C2CB",
        });
      }

      return finalStatus === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  async scheduleWaterReminders(intervalHours: number): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllReminders();

      // Schedule notifications for the next 24 hours
      const now = new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      let currentTime = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);

      while (currentTime <= endTime) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💧 Hora de beber água!",
            body: "Que tal um copo de água agora? Seu corpo agradece!",
            sound: true,
            data: { type: "water_reminder" },
          },
          trigger: {
            type: "date",
            date: currentTime,
          } as Notifications.DateTriggerInput,
        });

        currentTime = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error("Error scheduling water reminders:", error);
      throw error;
    }
  }

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling reminders:", error);
      throw error;
    }
  }

  async sendGoalAchievedNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Parabéns!",
          body: "Você atingiu sua meta diária de hidratação! Continue assim amanhã!",
          sound: true,
          data: { type: "goal_achieved" },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending goal achieved notification:", error);
    }
  }

  async getScheduledNotificationsCount(): Promise<number> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error("Error getting scheduled notifications count:", error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
