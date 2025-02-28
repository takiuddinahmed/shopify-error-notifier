import prisma from "app/db.server";
import type { AlertType } from "@prisma/client";
import { AlertStatus } from "@prisma/client";

export class AlertMessagesService {
  private prisma = prisma;
  async getAlertMessages(shopId: string, page: number, perPage: number) {
    const skip = (page - 1) * perPage;
    const [alertMessages, total] = await Promise.all([
      this.prisma.alertMessage.findMany({
        where: { shopId },
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.alertMessage.count({ where: { shopId } }),
    ]);

    return { alertMessages, total };
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
        status: AlertStatus.SUCCESS,
      },
    });
  }
  async updateAlertStatus(id: string, status: AlertStatus) {
    return this.prisma.alertMessage.update({
      where: { id },
      data: { status },
    });
  }
}
