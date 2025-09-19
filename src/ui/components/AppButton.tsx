import * as React from "react";

type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

export function AppButton({
  children,
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        // base
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2",
        "text-sm font-semibold shadow-sm focus:outline-none focus-visible:ring-2",
        // diseño pedido
        "bg-[#0B61E0] text-white hover:bg-[#0A56C7] focus-visible:ring-[#0B61E0]/40",
        // estados
        isDisabled ? "opacity-60 cursor-not-allowed" : "",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {leftIcon ? <span className="h-4 w-4">{leftIcon}</span> : null}
      <span>{loading ? "Procesando..." : children}</span>
      {rightIcon ? <span className="h-4 w-4">{rightIcon}</span> : null}
    </button>
  );
}
