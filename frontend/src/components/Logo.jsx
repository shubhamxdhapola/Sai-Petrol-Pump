import { TbGasStation } from "react-icons/tb";

export default function Logo({ compact = false, isLogo = true }) {
  return (
    <div className="flex justify-center items-center gap-2">
      {isLogo && <TbGasStation className="text-4xl text-brand shrink-0" />}
      {!compact && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="text-xl font-bold leading-tight tracking-tight text-slate-800 whitespace-nowrap">
            Sai Petrol Pump
          </div>
          <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            Management Portal
          </div>
        </div>
      )}
    </div>
  );
}
