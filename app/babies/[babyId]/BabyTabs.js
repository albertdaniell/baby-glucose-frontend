"use client";

import { useState } from "react";

import AddReading from "./AddReading";
import GlucoseChart from "./GlucoseChart";
import GlucoseReadings from "./GlucoseReadings";
import BabyDrugs from "./BabyDrugs";


export default function BabyTabs({
    baby,
    readings,
    readingsError,
}) {

    const [activeTab, setActiveTab] = useState("glucose");


    return (

        <>

            {/* =========================================
                TABS
            ========================================== */}

            <div className="mb-6 flex gap-2 rounded-2xl bg-white/70 p-2 shadow-sm backdrop-blur">

                <button
                    onClick={() => setActiveTab("glucose")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
                        activeTab === "glucose"
                            ? "bg-sky-500 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    <span>🩸</span>

                    Glucose

                </button>


                <button
                    onClick={() => setActiveTab("drugs")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
                        activeTab === "drugs"
                            ? "bg-purple-500 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    <span>💊</span>

                    Baby Drugs

                </button>

            </div>



            {/* =========================================
                GLUCOSE TAB
            ========================================== */}

            {activeTab === "glucose" && (

                <div>


                    {/* READINGS ERROR */}

                    {readingsError && (

                        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                            <div className="flex items-start gap-3">

                                <div className="text-2xl">
                                    ⚠️
                                </div>


                                <div>

                                    <h3 className="font-semibold text-amber-800">
                                        Could not load glucose readings
                                    </h3>


                                    <p className="mt-1 text-sm text-amber-700">
                                        {readingsError}
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}



                    {/* BABY INFO + LATEST READING */}

                    <div className="mb-6 grid gap-6 lg:grid-cols-3">


                        {/* BABY INFORMATION */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h2 className="font-[family-name:var(--font-baloo)] text-xl text-slate-800">

                                Baby Information 🍼

                            </h2>


                            <div className="mt-5 space-y-4">


                                <div>

                                    <p className="text-sm text-slate-500">
                                        Name
                                    </p>

                                    <p className="font-semibold text-slate-900">
                                        {baby.name}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-slate-500">
                                        Date of Birth
                                    </p>

                                    <p className="font-semibold text-slate-900">
                                        {baby.date_of_birth}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-slate-500">
                                        Baby Unique ID
                                    </p>

                                    <p className="break-all font-semibold text-slate-900">
                                        {baby.baby_id}
                                    </p>

                                </div>

                            </div>

                        </section>



                        {/* LATEST GLUCOSE READING */}

                        {readings.length > 0 ? (

                            <section className="rounded-2xl bg-purple-200 p-6 text-slate-800 shadow-sm lg:col-span-2">

                                <p className="text-sm font-medium text-slate-600">

                                    Latest Glucose Reading 🩸

                                </p>


                                <div className="mt-3 flex items-end gap-2">

                                    <span className="text-5xl font-bold sm:text-6xl">

                                        {readings[0].value}

                                    </span>


                                    <span className="mb-1 text-lg text-slate-600">

                                        mmol/L

                                    </span>

                                </div>


                                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">


                                    <div className="rounded-xl bg-white/40 px-4 py-2">

                                        📅 {readings[0].measured_date}

                                    </div>


                                    <div className="rounded-xl bg-white/40 px-4 py-2">

                                        🕐 {readings[0].measured_time}

                                    </div>

                                </div>

                            </section>

                        ) : (

                            <section className="flex min-h-[200px] flex-col justify-center rounded-2xl bg-purple-100 p-6 text-center text-slate-700 shadow-sm lg:col-span-2">

                                <div className="text-5xl">
                                    🩸
                                </div>


                                <h3 className="mt-4 font-[family-name:var(--font-baloo)] text-2xl">

                                    No Readings Yet

                                </h3>


                                <p className="mt-2 text-sm text-slate-600">

                                    Add the first glucose reading for {baby.name}.

                                </p>

                            </section>

                        )}

                    </div>



                    {/* GLUCOSE CHART */}

                    {readings.length > 0 && (

                        <GlucoseChart
                            readings={readings}
                        />

                    )}



                    {/* ADD READING */}

                    <section className="mb-8">

                        <AddReading
                            babyId={baby.baby_id}
                        />

                    </section>



                    {/* GLUCOSE READINGS */}

                    <GlucoseReadings
                        readings={readings}
                        babyId={baby.baby_id}
                    />

                </div>

            )}



            {/* =========================================
                BABY DRUGS TAB
            ========================================== */}

            {activeTab === "drugs" && (

               <BabyDrugs baby={baby} babyId={baby.baby_id} />

            )}

        </>

    );

}