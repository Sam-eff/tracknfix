export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: "admin" | "staff" | "technician";
  shop: number;
  shop_name: string;
}

export interface Shop {
  id: number;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  logo: string | null;
  subscription_is_active: boolean;
  is_in_trial: boolean;
  subscription_expires_at: string | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  category: number | null;
  category_name: string | null;
  cost_price: string;
  selling_price: string;
  profit_margin: number;
  quantity: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  is_active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  unit_cost: string;
  subtotal: number;
  profit: number;
}

export interface Sale {
  id: number;
  customer: number | null;
  customer_name: string;
  staff: number;
  staff_name: string;
  items: SaleItem[];
  total_amount: string;
  total_profit: string;
  note: string;
  created_at: string;
}

export interface RepairTicket {
  id: number;
  customer: number | null;
  customer_name: string;
  technician: number | null;
  technician_name: string;
  device_type: string;
  device_model: string;
  issue_description: string;
  estimated_cost: string;
  final_cost: string | null;
  amount_paid: string;
  status: "received" | "diagnosing" | "waiting_parts" | "fixed" | "collected";
  status_display: string;
  note: string;
  parts: RepairPart[];
  created_at: string;
}

export interface RepairPart {
  id: number;
  product: number;
  product_name: string;
  quantity_used: number;
  unit_cost: string;
}

export interface DashboardStats {
  inventory: {
    total_products: number;
    low_stock_count: number;
  };
  sales_today: {
    count: number;
    revenue: number;
    profit: number;
  };
  revenue_all_time: number;
  repairs: {
    active: number;
    completed_today: number;
    by_status: Record<string, number>;
  };
}
