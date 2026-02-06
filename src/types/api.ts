export interface Account {
  id: number;
  userID: number;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userID: number;
  type: "transfer" | "exchange" | string;
  status: "pending" | "completed" | "failed" | string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface MeResponse {
  id: number;
  email: string;
  name: string;
}

export interface TransferRequest {
  from_account_id: number;
  to_account_id: number;
  amount: string;
}

export interface TransferResponse {
  message: string;
}

export interface ExchangeRequest {
  from_account_id: number;
  to_account_id: number;
  amount: string;
}

export interface ExchangeResponse {
  message: string;
}

export interface AccountBalanceResponse {
  id: number;
  currency: string;
  balance: number;
}
