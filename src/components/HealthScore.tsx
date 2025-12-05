import React from "react";

type Props = {
  temperature: number;
  vibration: number;
  load: number;
  className?: string;
};

export default function HealthScore({ temperature, vibration, load, className }: Props) {
  const calculate = (temp: number, vib: number, loadVal: number) => {
    let score = 100;

    if (temp >= 90) score -= 45;
    else if (temp >= 75) score -= 30;
    else if (temp >= 60) score -= 12;
    else if (temp >= 50) score -= 6;

    if (vib >= 10) score -= 40;
    else if (vib >= 7) score -= 25;
    else if (vib >= 4) score -= 12;
    else if (vib >= 2.5) score -= 6;

    if (loadVal >= 95) score -= 20;
    else if (loadVal >= 85) score -= 12;
    else if (loadVal >= 70) score -= 6;

    return Math.max(5, Math.round(score));
  };

  const value = calculate(temperature, vibration, load);
  const color =
    value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-400" : value >= 40 ? "bg-orange-500" : "bg-red-600";

  return (
    <div className={className}>
      <div className="text-sm font-medium mb-1">Health</div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`${color} h-3`} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-1 text-xs">{value}%</div>
    </div>
  );
}
