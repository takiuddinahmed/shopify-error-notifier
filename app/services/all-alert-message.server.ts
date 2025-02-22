import prisma from "app/db.server";
import type { AlertType } from "@prisma/client";
import { AlertStatus } from "@prisma/client";

export class AlertMessagesService {
  static async getAlertMessages(shopId: string) {
    return prisma.alertMessage.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAlert(data: {
    shopId: string;
    alertType: AlertType;
    message: string;
  }) {
    return prisma.alertMessage.create({
      data: {
        shopId: data.shopId,
        alertType: data.alertType,
        message: data.message,
        status: AlertStatus.Success,
      },
    });
  }

  static async resendAlert(id: string) {
    return prisma.alertMessage.update({
      where: { id },
      data: { status: AlertStatus.Success },
    });
  }
}
