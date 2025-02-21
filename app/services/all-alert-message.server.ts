import prisma from "app/db.server";
import { AlertType } from "app/types/allAlerts";

interface CreateAlertData {
  shopId: string;
  alertType: AlertType;
  message: string;
}

export class AlertMessagesService {
  static async getAlertMessages(shopId: string) {
    return prisma.alertMessage.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAlert(data: CreateAlertData) {
    return prisma.alertMessage.create({
      data: {
        ...data,
        status: "Success",
      },
    });
  }

  static async resendAlert(id: string) {
    const alert = await prisma.alertMessage.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new Error("Alert not found");
    }

    // Here you would implement the actual resend logic
    // For now, we'll just create a new alert with the same data
    return prisma.alertMessage.create({
      data: {
        shopId: alert.shopId,
        alertType: alert.alertType,
        message: alert.message,
        status: "Success",
      },
    });
  }
}
