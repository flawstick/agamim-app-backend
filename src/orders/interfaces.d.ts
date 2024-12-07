import { IStatusUpdate } from "@/models/order";

// Option Interface
interface IOption {
  name: string;
  price: number;
  quantity: number;
  multiple?: boolean;
}

// Modifier Interface
interface IModifier {
  name: string;
  required: boolean;
  multiple: boolean;
  max?: number;
  options: IOption[];
}

// Order Item Interface
interface IOrderItem {
  name: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  modifiers: IModifier[];
}

// Order Status Type
type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "rejected"
  | "cancelled"
  | string;

// Returned Order Interface
export interface IOrder {
  _id?: string;
  userId?: string;
  items: IOrderItem[];
  status: OrderStatus;
  statusUpdates?: IStatusUpdate[];
  customerName?: string;
  customerProfile?: any;
  orderNumber?: string;
  createdA?: string; // ISO 8601 date string
  tenantId?: string;
  companyName?: string;
  comapnyProfile?: any;
  tip?: number;
  discountedPrice?: number;
  address?: string;
  messageToKitchen?: string;
}
