import { cn } from "@/lib/utils";

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassmorphismCard({ children, className, glow = false }: GlassmorphismCardProps) {
  return (
    <div 
      className={cn(
        "glass-effect rounded-lg p-6",
        glow && "glow-effect",
        className
      )}
    >
      {children}
    </div>
  );
}
