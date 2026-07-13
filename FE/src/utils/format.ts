import { dateConfig, formatInTz } from "./dateConfig";

export const currency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
export const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
export const dateTime = (value: string) => formatInTz(new Date(value), dateConfig.timezone, dateConfig.dateTimeFormat);
