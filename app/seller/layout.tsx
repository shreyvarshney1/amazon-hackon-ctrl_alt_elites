import { SellerAuthProvider } from "@/context/seller-auth-context";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerAuthProvider>{children}</SellerAuthProvider>;
}
