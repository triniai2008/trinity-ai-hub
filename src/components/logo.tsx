import logoDark from "@/assets/triniai-logo-dark.png";
import logoLight from "@/assets/triniai-logo-light.png";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <>
      <img
        src={logoDark}
        alt="TriniAI"
        className={cn("hidden dark:block object-contain", className)}
      />
      <img
        src={logoLight}
        alt="TriniAI"
        className={cn("block dark:hidden object-contain", className)}
      />
    </>
  );
}
