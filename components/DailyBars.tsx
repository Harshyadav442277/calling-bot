"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DayPoint {
  date: string;
  label: string;
  full: string;
  bookings: number;
}

function TooltipBox({ active, payload }: { active?: boolean; payload?: { payload: DayPoint }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-2xl bg-ink px-3 py-2 text-xs text-white shadow-lg">
      <p className="text-white/70">{p.full}</p>
      <p className="tabular mt-0.5 text-sm font-semibold">{p.bookings} booked</p>
    </div>
  );
}

export function DailyBars({ points }: { points: DayPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -20 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#e6e4ee" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6c6a7a", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6c6a7a", fontSize: 11 }} allowDecimals={false} width={44} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "#efebfd" }} />
          <Bar dataKey="bookings" fill="#5b4bc4" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
