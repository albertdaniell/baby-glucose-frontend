"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


export default function GlucoseChart({ readings }) {
    // Get the latest 10 readings
    const latestReadings = readings
        .slice(0, 10)
        .reverse()
        .map((reading) => ({
            value: Number(reading.value),
            date: reading.measured_date,
            time: reading.measured_time,
            label: `${reading.measured_date} ${reading.measured_time}`,
        }));


    return (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
                <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">
                    Glucose Trend
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Your baby's latest 10 glucose readings
                </p>
            </div>


            {latestReadings.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-slate-500">
                        No readings available yet.
                    </p>
                </div>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={latestReadings}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 10,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                            />

                            <XAxis
                                dataKey="time"
                                tick={{
                                    fontSize: 12,
                                }}
                                stroke="#94a3b8"
                            />

                            <YAxis
                                tick={{
                                    fontSize: 12,
                                }}
                                stroke="#94a3b8"
                            />

                            <Tooltip
                                formatter={(value) => [
                                    `${value} mmol/L`,
                                    "Glucose",
                                ]}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0) {
                                        return payload[0].payload.label;
                                    }

                                    return label;
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#38bdf8"
                                strokeWidth={3}
                                dot={{
                                    r: 5,
                                }}
                                activeDot={{
                                    r: 7,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

        </section>
    );
}