export interface Seller {
  id: string;
  name: string;
  email: string;
  scs_score: number;
  created_at: string;
  last_scs_update: string | null;
}

export interface SellerLoginCredentials {
  email: string;
  username?: string;
}

export interface SellerLoginResponse {
  message: string;
  token: string;
}
