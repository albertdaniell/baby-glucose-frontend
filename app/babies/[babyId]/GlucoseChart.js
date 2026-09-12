"use client";

import { useMemo } from "react";

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


    // =====================================================
    // PREPARE READINGS
    // =====================================================

    const latestReadings = useMemo(() => {

        return readings
            .slice(0, 5)
            .reverse()
            .map((reading) => ({

                id: reading.id,

                value: Number(reading.value),

                date: reading.measured_date,

                time: reading.measured_time,

                label: `${reading.measured_date} ${reading.measured_time}`,

                displayDate: new Date(
                    `${reading.measured_date}T00:00:00`
                ).toLocaleDateString(
                    undefined,
                    {
                        month: "short",
                        day: "numeric",
                    }
                ),

            }));

    }, [readings]);


    // =====================================================
    // CALCULATE STATISTICS
    // =====================================================

    const statistics = useMemo(() => {

        if (readings.length === 0) {

            return null;

        }


        const values = readings.map(
            (reading) => Number(reading.value)
        );


        const total = values.reduce(
            (sum, value) => sum + value,
            0
        );


        const average = total / values.length;


        const highest = Math.max(
            ...values
        );


        const lowest = Math.min(
            ...values
        );


        // Latest reading is expected
        // to be the first item

        const latest = readings[0];


        // =================================================
        // TREND
        //
        // Compare the newest reading with the previous one
        // =================================================

        let trend = "stable";

        let trendDifference = 0;


        if (readings.length >= 2) {

            const newestValue =
                Number(readings[0].value);


            const previousValue =
                Number(readings[1].value);


            trendDifference =
                newestValue -
                previousValue;


            if (trendDifference > 0.1) {

                trend = "up";

            } else if (trendDifference < -0.1) {

                trend = "down";

            }

        }


        return {

            totalReadings:
                readings.length,

            average,

            highest,

            lowest,

            latest,

            trend,

            trendDifference,

        };

    }, [readings]);


    // =====================================================
    // FORMAT LATEST DATE
    // =====================================================

    function formatLatestDate(reading) {

        if (!reading) {

            return "";

        }


        const date = new Date(
            `${reading.measured_date}T00:00:00`
        );


        const formattedDate =
            date.toLocaleDateString(
                undefined,
                {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }
            );


        return `${formattedDate} • ${reading.measured_time}`;

    }


    // =====================================================
    // CUSTOM TOOLTIP
    // =====================================================

    function CustomTooltip({
        active,
        payload,
    }) {

        if (
            !active ||
            !payload ||
            payload.length === 0
        ) {

            return null;

        }


        const reading =
            payload[0].payload;


        return (

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">


                <p className="text-xs font-medium text-slate-500">

                    {reading.displayDate}

                </p>


                <p className="mt-1 text-sm text-slate-500">

                    {reading.time}

                </p>


                <div className="mt-2 flex items-baseline gap-1">

                    <span className="text-xl font-bold text-slate-800">

                        {reading.value.toFixed(2)}

                    </span>


                    <span className="text-xs text-slate-500">

                        mmol/L

                    </span>

                </div>

            </div>

        );

    }


    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (readings.length === 0) {

        return (

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


                <div>

                    <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                        Glucose Overview 🩸

                    </h2>


                    <p className="mt-1 text-sm text-slate-500">

                        Track glucose readings and trends over time.

                    </p>

                </div>


                <div className="flex h-72 flex-col items-center justify-center text-center">


                    <div className="mb-4 text-5xl">

                        🩸

                    </div>


                    <h3 className="font-semibold text-slate-700">

                        No glucose readings yet

                    </h3>


                    <p className="mt-1 text-sm text-slate-500">

                        Add glucose readings to start tracking trends.

                    </p>

                </div>

            </section>

        );

    }


    // =====================================================
    // TREND DISPLAY
    // =====================================================

    const trendConfig = {

        up: {

            icon: "↗",

            label: "Increasing",

            className:
                "bg-amber-50 text-amber-700",

        },

        down: {

            icon: "↘",

            label: "Decreasing",

            className:
                "bg-sky-50 text-sky-700",

        },

        stable: {

            icon: "→",

            label: "Stable",

            className:
                "bg-slate-100 text-slate-700",

        },

    };


    const currentTrend =
        trendConfig[statistics.trend];


    return (

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


            {/* ========================================= */}
            {/* HEADER */}
            {/* ========================================= */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">


                <div>

                    <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                        Glucose Overview 🩸

                    </h2>


                    <p className="mt-1 text-sm text-slate-500">

                        Recent glucose readings and trends

                    </p>

                </div>


                {/* Trend Badge */}

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${currentTrend.className}`}
                >

                    <span className="text-lg">

                        {currentTrend.icon}

                    </span>


                    {currentTrend.label}

                </div>

            </div>


            {/* ========================================= */}
            {/* STATISTICS */}
            {/* ========================================= */}

          <div className="mt-4 -mx-1 overflow-x-auto px-1 pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

    <div className="flex w-max snap-x snap-mandatory gap-2">


        {/* Latest */}

        <div className="w-[115px] shrink-0 snap-start rounded-lg border border-sky-100 bg-sky-50 p-2">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-sky-600">
                Latest
            </p>

            <div className="mt-1 flex items-baseline gap-0.5">

                <span className="text-lg font-bold text-slate-800">
                    {Number(
                        statistics.latest.value
                    ).toFixed(2)}
                </span>

                <span className="text-[9px] text-slate-500">
                    mmol/L
                </span>

            </div>

            <p className="mt-1 truncate text-[9px] text-slate-500">
                {formatLatestDate(
                    statistics.latest
                )}
            </p>

        </div>


        {/* Average */}

        <div className="w-[115px] shrink-0 snap-start rounded-lg border border-slate-200 bg-white p-2">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Average
            </p>

            <div className="mt-1 flex items-baseline gap-0.5">

                <span className="text-lg font-bold text-slate-800">
                    {statistics.average.toFixed(2)}
                </span>

                <span className="text-[9px] text-slate-500">
                    mmol/L
                </span>

            </div>

            <p className="mt-1 text-[9px] text-slate-400">
                All readings
            </p>

        </div>


        {/* Highest */}

        <div className="w-[115px] shrink-0 snap-start rounded-lg border border-red-100 bg-red-50 p-2">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-red-600">
                Highest
            </p>

            <div className="mt-1 flex items-baseline gap-0.5">

                <span className="text-lg font-bold text-slate-800">
                    {statistics.highest.toFixed(2)}
                </span>

                <span className="text-[9px] text-slate-500">
                    mmol/L
                </span>

            </div>

            <p className="mt-1 truncate text-[9px] text-slate-400">
                Maximum
            </p>

        </div>


        {/* Lowest */}

        <div className="w-[115px] shrink-0 snap-start rounded-lg border border-indigo-100 bg-indigo-50 p-2">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-indigo-600">
                Lowest
            </p>

            <div className="mt-1 flex items-baseline gap-0.5">

                <span className="text-lg font-bold text-slate-800">
                    {statistics.lowest.toFixed(2)}
                </span>

                <span className="text-[9px] text-slate-500">
                    mmol/L
                </span>

            </div>

            <p className="mt-1 truncate text-[9px] text-slate-400">
                Minimum
            </p>

        </div>


        {/* Total */}

        <div className="w-[115px] shrink-0 snap-start rounded-lg border border-slate-200 bg-slate-50 p-2">

            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Total
            </p>

            <div className="mt-1">

                <span className="text-lg font-bold text-slate-800">
                    {statistics.totalReadings}
                </span>

            </div>

            <p className="mt-1 text-[9px] text-slate-400">
                Readings
            </p>

        </div>


    </div>

</div>

            {/* ========================================= */}
            {/* CHART HEADER */}
            {/* ========================================= */}

            <div className="mt-8 flex items-end justify-between">


                <div>

                    <h3 className="font-semibold text-slate-800">

                        Recent Trend

                    </h3>


                    <p className="mt-1 text-sm text-slate-500">

                        Showing the latest {latestReadings.length} readings

                    </p>

                </div>

            </div>


            {/* ========================================= */}
            {/* CHART */}
            {/* ========================================= */}

            <div className="mt-4 h-80 w-full">


                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >


                    <LineChart

                        data={latestReadings}

                        margin={{

                            top: 20,

                            right: 20,

                            left: -15,

                            bottom: 10,

                        }}

                    >


                        <CartesianGrid

                            vertical={false}

                            strokeDasharray="3 3"

                            stroke="#e2e8f0"

                        />


                        <XAxis

                            dataKey="displayDate"

                            tick={{

                                fontSize: 12,

                            }}

                            tickLine={false}

                            axisLine={false}

                            stroke="#94a3b8"

                        />


                        <YAxis

                            tick={{

                                fontSize: 12,

                            }}

                            tickLine={false}

                            axisLine={false}

                            stroke="#94a3b8"

                            width={40}

                            domain={[

                                (dataMin) =>
                                    Math.max(
                                        0,
                                        dataMin - 1
                                    ),

                                (dataMax) =>
                                    dataMax + 1,

                            ]}

                        />


                        <Tooltip

                            content={
                                <CustomTooltip />
                            }

                            cursor={{

                                stroke: "#cbd5e1",

                                strokeWidth: 1,

                            }}

                        />


                        <Line

                            type="monotone"

                            dataKey="value"

                            stroke="#0ea5e9"

                            strokeWidth={3}

                            dot={{

                                r: 4,

                                fill: "#ffffff",

                                stroke: "#0ea5e9",

                                strokeWidth: 3,

                            }}

                            activeDot={{

                                r: 7,

                                fill: "#0ea5e9",

                                stroke: "#ffffff",

                                strokeWidth: 3,

                            }}

                        />


                    </LineChart>


                </ResponsiveContainer>

            </div>


            {/* ========================================= */}
            {/* FOOTER */}
            {/* ========================================= */}

            <div className="mt-5 border-t border-slate-100 pt-4">


                <p className="text-xs leading-5 text-slate-400">

                    Statistics are calculated from all recorded glucose readings.
                    The chart displays the most recent readings.

                </p>

            </div>

        </section>

    );

}