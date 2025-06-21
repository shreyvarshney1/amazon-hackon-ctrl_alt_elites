import { Loader2 } from "lucide-react";

export default function Loader({
  text = "Loading...",
  size = 24,
}: {
  text?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="animate-spin text-[#ff9900]" style={{ width: size, height: size }} />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}