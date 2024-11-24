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

// Order Interface
export interface IOrder {
  items: IOrderItem[];
  status: OrderStatus;
  customerName: string;
  orderNumber: string;
  createdAt: string; // ISO 8601 date string
  companyName: string;
  address: string;
  messageToKitchen: string;
}
