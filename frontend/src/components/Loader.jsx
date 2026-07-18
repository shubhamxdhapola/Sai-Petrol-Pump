export default function Loader({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-brand ${sizes[size] || sizes.md}`}
      />
    </div>
  );
}
