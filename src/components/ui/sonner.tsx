import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0a0a0a]/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-[.toaster]:rounded-2xl group-[.toaster]:font-light group-[.toaster]:tracking-wide",
          description: "group-[.toast]:text-white/40",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-black",
          cancelButton: "group-[.toast]:bg-white/5 group-[.toast]:text-white/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
