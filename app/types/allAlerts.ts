export enum AlertType {
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  SIGN_IN = "SIGN_IN",
  SIGN_UP = "SIGN_UP",
  CHECK_OUT = "CHECK_OUT",
  SYSTEM_ISSUE = "SYSTEM_ISSUE",
}

export enum AlertStatus {
  Success = "Success",
  Error = "Error",
}

export interface AlertMessage {
  id: string;
  alertType: AlertType;
  message: string;
  createdAt: string;
  status: AlertStatus;
  shopId: string;
  errorMessage?: string;
}
