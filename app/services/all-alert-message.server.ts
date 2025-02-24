import prisma from "app/db.server";
import type { AlertType } from "@prisma/client";
import { AlertStatus } from "@prisma/client";

export class AlertMessagesService {
  private prisma = prisma;
  async getAlertMessages(shopId: string) {
    return this.prisma.alertMessage.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createAlert(data: {
    shopId: string;
    alertType: AlertType;
    message: string;
  }) {
    return this.prisma.alertMessage.create({
      data: {
        shopId: data.shopId,
        alertType: data.alertType,
        message: data.message,
        status: AlertStatus.Success,
      },
    });
  }
  async updateAlertStatus(id: string, status: AlertStatus) {
    return this.prisma.alertMessage.update({
      where: { id },
      data: { status },
    });
  }

  async resendAlert(id: string) {
    return this.prisma.alertMessage.update({
      where: { id },
      data: { status: AlertStatus.Success },
    });
  }
}
