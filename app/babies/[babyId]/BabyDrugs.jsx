"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL_2;


/* =====================================================
   REUSABLE FORM LABEL
===================================================== */

function FormLabel({ children }) {
    return (
        <label className="mb-2 block text-sm font-semibold text-slate-700">
            {children}
        </label>
    );
}


/* =====================================================
   BABY DRUGS COMPONENT
===================================================== */

export default function BabyDrugs({ babyId, baby }) {


    /* =====================================================
       TABS
    ===================================================== */

    const [activeTab, setActiveTab] = useState("upcoming");


    /* =====================================================
       DATA
    ===================================================== */

    const [drugs, setDrugs] = useState([]);
    const [plans, setPlans] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [records, setRecords] = useState([]);

    const [upcoming, setUpcoming] = useState([]);
    const [nextDrug, setNextDrug] = useState(null);


    /* =====================================================
       UI STATE
    ===================================================== */

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* =====================================================
       FORMS
    ===================================================== */

    const [drugForm, setDrugForm] = useState({
        name: "",
        administration_type: "measurement",
        amount: "",
        unit: "",
        notes: "",
        image: null,
    });


    const [planForm, setPlanForm] = useState({
        drug: "",
        times_per_day: 1,
        start_date: "",
        end_date: "",
        notes: "",
    });


    const [scheduleForm, setScheduleForm] = useState({
        baby_drug_plan: "",
        dose_order: 1,
        scheduled_time: "",
        amount: "",
        unit: "",
    });


    const [recordForm, setRecordForm] = useState({
        schedule: "",
        date: new Date().toISOString().split("T")[0],
        status: "taken",
        notes: "",
    });


    /* =====================================================
       IMAGE HELPER
    ===================================================== */

    /* =====================================================
   GROUP UPCOMING DRUGS BY TIME
===================================================== */

const groupedUpcoming = upcoming.reduce(
    (groups, record) => {

        const time =
            record.proposed_time ||
            record.scheduled_time ||
            "Unknown";


        if (!groups[time]) {

            groups[time] = [];

        }


        groups[time].push(record);


        return groups;

    },
    {}
);


/* =====================================================
   SORT GROUPS BY TIME
===================================================== */

const upcomingTimeGroups = Object.entries(
    groupedUpcoming
).sort(([timeA], [timeB]) => {

    return timeA.localeCompare(timeB);

});

    function getDrugImage(item) {

        if (!item) {
            return null;
        }


        /*
        ==========================================
        DIRECT IMAGE URL
        ==========================================
        */

        if (item.image_url) {
            return item.image_url;
        }


        /*
        ==========================================
        IMAGE FIELD
        ==========================================
        */

        if (item.image) {

            if (
                typeof item.image === "string" &&
                item.image.startsWith("http")
            ) {
                return item.image;
            }

            return `${API_URL}${item.image}`;

        }


        /*
        ==========================================
        DRUG DETAILS
        ==========================================
        */

        if (item.drug_details) {

            return getDrugImage(
                item.drug_details
            );

        }


        return null;

    }


    /* =====================================================
       GET DRUG NAME
    ===================================================== */

    function getDrugName(item) {

        if (!item) {
            return "Unknown Drug";
        }


        if (item.drug_name) {
            return item.drug_name;
        }


        if (item.name) {
            return item.name;
        }


        if (item.drug_details?.name) {
            return item.drug_details.name;
        }


        return "Unknown Drug";

    }


    /* =====================================================
       GET DRUG AMOUNT
    ===================================================== */

    function getDrugAmount(item) {

        if (!item) {
            return "";
        }


        const amount =
            item.amount ??
            item.drug_details?.amount ??
            "";


        const unit =
            item.unit ??
            item.drug_details?.unit ??
            "";


        if (!amount && !unit) {
            return "";
        }


        return `${amount} ${unit}`.trim();

    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(time) {

        if (!time) {
            return "";
        }


        return String(time).slice(0, 5);

    }


    /* =====================================================
       SELECTED ITEMS
    ===================================================== */

    const selectedDrug = drugs.find(
        (drug) =>
            String(drug.id) ===
            String(planForm.drug)
    );


    const selectedPlan = plans.find(
        (plan) =>
            String(plan.id) ===
            String(scheduleForm.baby_drug_plan)
    );


    const selectedSchedule = schedules.find(
        (schedule) =>
            String(schedule.id) ===
            String(recordForm.schedule)
    );


    const selectedIntakeDrug =
        selectedSchedule?.drug_details ||
        null;


    /* =====================================================
       LOAD DATA
    ===================================================== */

    async function loadData() {

        try {

            setLoading(true);
            setError("");


            const [
                drugsResponse,
                plansResponse,
                schedulesResponse,
                recordsResponse,
                upcomingResponse,
            ] = await Promise.all([

                /*
                ==========================================
                DRUGS
                ==========================================
                */

                fetch(
                    `${API_URL}/drugs/`,
                    {
                        cache: "no-store",
                    }
                ),


                /*
                ==========================================
                PLANS
                ==========================================
                */

                fetch(
                    `${API_URL}/drug-plans/?baby_id=${babyId}`,
                    {
                        cache: "no-store",
                    }
                ),


                /*
                ==========================================
                SCHEDULES
                ==========================================
                */

                fetch(
                    `${API_URL}/drug-schedules/?baby_id=${babyId}`,
                    {
                        cache: "no-store",
                    }
                ),


                /*
                ==========================================
                INTAKE RECORDS
                ==========================================
                */

                fetch(
                    `${API_URL}/drug-intake-records/?baby_id=${babyId}`,
                    {
                        cache: "no-store",
                    }
                ),


                /*
                ==========================================
                UPCOMING DRUGS

                YOUR DJANGO VIEW:
                upcoming_drugs
                ==========================================
                */

                fetch(
                    `${API_URL}/upcoming/?baby_id=${babyId}`,
                    {
                        cache: "no-store",
                    }
                ),

            ]);


            /*
            ==========================================
            DRUGS
            ==========================================
            */

            if (drugsResponse.ok) {

                const data =
                    await drugsResponse.json();

                setDrugs(
                    data.results || data
                );

            }


            /*
            ==========================================
            PLANS
            ==========================================
            */

            if (plansResponse.ok) {

                const data =
                    await plansResponse.json();

                setPlans(
                    data.results || data
                );

            }


            /*
            ==========================================
            SCHEDULES
            ==========================================
            */

            if (schedulesResponse.ok) {

                const data =
                    await schedulesResponse.json();

                setSchedules(
                    data.results || data
                );

            }


            /*
            ==========================================
            RECORDS
            ==========================================
            */

            if (recordsResponse.ok) {

                const data =
                    await recordsResponse.json();

                setRecords(
                    data.results || data
                );

            }


            /*
            ==========================================
            UPCOMING DRUGS
            ==========================================
            */

            if (upcomingResponse.ok) {

                const data =
                    await upcomingResponse.json();

                setUpcoming(
                    data.upcoming || []
                );

                setNextDrug(
                    data.next_drug || null
                );

            } else {

                setUpcoming([]);
                setNextDrug(null);

            }


        } catch (error) {

            console.error(error);

            setError(
                "Unable to load baby drug information."
            );

        } finally {

            setLoading(false);

        }

    }


    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {

        if (babyId) {
            loadData();
        }

    }, [babyId]);


    /* =====================================================
       ADD DRUG
    ===================================================== */

    async function handleAddDrug(event) {

        event.preventDefault();

        try {

            const formData = new FormData();


            formData.append(
                "name",
                drugForm.name
            );


            formData.append(
                "administration_type",
                drugForm.administration_type
            );


            if (drugForm.amount) {

                formData.append(
                    "amount",
                    drugForm.amount
                );

            }


            formData.append(
                "unit",
                drugForm.unit
            );


            formData.append(
                "notes",
                drugForm.notes
            );


            if (drugForm.image) {

                formData.append(
                    "image",
                    drugForm.image
                );

            }


            const response = await fetch(
                `${API_URL}/drugs/`,
                {
                    method: "POST",
                    body: formData,
                }
            );


            if (!response.ok) {

                const errorData =
                    await response.json();

                alert(
                    JSON.stringify(
                        errorData,
                        null,
                        2
                    )
                );

                return;

            }


            setDrugForm({
                name: "",
                administration_type: "measurement",
                amount: "",
                unit: "",
                notes: "",
                image: null,
            });


            await loadData();

            alert("Drug added successfully.");


        } catch (error) {

            console.error(error);

            alert("Could not add drug.");

        }

    }


    /* =====================================================
       ADD DRUG PLAN
    ===================================================== */

    async function handleAddPlan(event) {

        event.preventDefault();

        try {

            const response = await fetch(
                `${API_URL}/drug-plans/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({

                        baby: baby.id,

                        baby_id:
                            baby.baby_id,

                        drug:
                            Number(planForm.drug),

                        times_per_day:
                            Number(
                                planForm.times_per_day
                            ),

                        start_date:
                            planForm.start_date || null,

                        end_date:
                            planForm.end_date || null,

                        notes:
                            planForm.notes,

                    }),
                }
            );


            if (!response.ok) {

                const errorData =
                    await response.json();

                alert(
                    JSON.stringify(
                        errorData,
                        null,
                        2
                    )
                );

                return;

            }


            setPlanForm({
                drug: "",
                times_per_day: 1,
                start_date: "",
                end_date: "",
                notes: "",
            });


            await loadData();

            alert(
                "Baby drug plan created successfully."
            );


        } catch (error) {

            console.error(error);

            alert(
                "Could not create drug plan."
            );

        }

    }


    /* =====================================================
       ADD SCHEDULE
    ===================================================== */

    async function handleAddSchedule(event) {

        event.preventDefault();

        try {

            const response = await fetch(
                `${API_URL}/drug-schedules/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({

                        baby_drug_plan:
                            Number(
                                scheduleForm.baby_drug_plan
                            ),

                        dose_order:
                            Number(
                                scheduleForm.dose_order
                            ),

                        scheduled_time:
                            scheduleForm.scheduled_time,

                        amount:
                            scheduleForm.amount || null,

                        unit:
                            scheduleForm.unit,

                    }),
                }
            );


            if (!response.ok) {

                const errorData =
                    await response.json();

                alert(
                    JSON.stringify(
                        errorData,
                        null,
                        2
                    )
                );

                return;

            }


            setScheduleForm({
                baby_drug_plan: "",
                dose_order: 1,
                scheduled_time: "",
                amount: "",
                unit: "",
            });


            await loadData();

            alert(
                "Drug schedule added successfully."
            );


        } catch (error) {

            console.error(error);

            alert(
                "Could not add schedule."
            );

        }

    }


    /* =====================================================
       ADD INTAKE RECORD
    ===================================================== */

    async function handleAddRecord(event) {

        event.preventDefault();

        try {

            const response = await fetch(
                `${API_URL}/drug-intake-records/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({

                        schedule:
                            Number(
                                recordForm.schedule
                            ),

                        date:
                            recordForm.date,

                        status:
                            recordForm.status,

                        notes:
                            recordForm.notes,

                    }),
                }
            );


            if (!response.ok) {

                const errorData =
                    await response.json();

                alert(
                    JSON.stringify(
                        errorData,
                        null,
                        2
                    )
                );

                return;

            }


            setRecordForm({
                schedule: "",
                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],
                status: "taken",
                notes: "",
            });


            await loadData();

            alert(
                "Drug intake recorded successfully."
            );


        } catch (error) {

            console.error(error);

            alert(
                "Could not record drug intake."
            );

        }

    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">

                <div className="text-5xl">
                    💊
                </div>

                <p className="mt-4 text-slate-500">
                    Loading baby drugs...
                </p>

            </div>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-600">

                    {error}

                </div>

            )}


            {/* =================================================
                TABS
            ================================================= */}

            <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">


                {/* UPCOMING */}

                <button
                    onClick={() =>
                        setActiveTab("upcoming")
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "upcoming"
                            ? "bg-orange-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    ⏰ Upcoming Drugs

                    {upcoming.length > 0 && (

                        <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                activeTab === "upcoming"
                                    ? "bg-white/20 text-white"
                                    : "bg-orange-100 text-orange-600"
                            }`}
                        >
                            {upcoming.length}
                        </span>

                    )}

                </button>

                {/* INTAKE */}

                <button
                    onClick={() =>
                        setActiveTab("intake")
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "intake"
                            ? "bg-green-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    ✅ Drug Intake
                </button>


                {/* PLANS */}

                <button
                    onClick={() =>
                        setActiveTab("plans")
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "plans"
                            ? "bg-sky-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    💊 Drug Plans
                </button>


                {/* SCHEDULES */}

                <button
                    onClick={() =>
                        setActiveTab("schedules")
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "schedules"
                            ? "bg-purple-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    📅 Schedules
                </button>


                


                {/* ADD DRUG */}

                <button
                    onClick={() =>
                        setActiveTab("add-drug")
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "add-drug"
                            ? "bg-pink-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    ➕ Add Drug
                </button>

            </div>


            {/* =================================================
                UPCOMING DRUGS
            ================================================= */}

            {activeTab === "upcoming" && (

                <div className="space-y-6">


                    {/* HEADER */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <div className="flex flex-wrap items-center justify-between gap-4">

                            <div>

                                <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                                    ⏰ Upcoming Drugs

                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    Medicines that are still scheduled for today.

                                </p>

                            </div>


                            <button
                                onClick={loadData}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                                🔄 Refresh
                            </button>

                        </div>

                    </section>


                    {/* NEXT DRUG */}

                    {nextDrug && (

    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white shadow-sm">


        {/* =============================================
            LARGE BACKGROUND DRUG IMAGE
        ============================================= */}

        {getDrugImage(nextDrug) && (

            <img
                src={getDrugImage(nextDrug)}
                alt=""
                className="pointer-events-none absolute -right-8 -bottom-8 h-72 w-72 rotate-[-12deg] object-cover opacity-30"
            />

        )}


        {/* =============================================
            LIGHT OVERLAY
        ============================================= */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/90 via-orange-500/60 to-orange-500/20" />


        {/* =============================================
            CONTENT
        ============================================= */}

        <div className="relative z-10">


            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/90">

                🔔 NEXT MEDICINE

            </div>


            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">


                {/* DRUG INFORMATION */}

                <div className="flex items-center gap-5">


                    {/* SMALL DRUG IMAGE */}

                    {getDrugImage(nextDrug) ? (

                        <img
                            src={getDrugImage(nextDrug)}
                            alt={getDrugName(nextDrug)}
                            className="h-20 w-20 rounded-2xl border-2 border-white/30 bg-white object-cover shadow-xl"
                        />

                    ) : (

                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur-sm">

                            💊

                        </div>

                    )}


                    {/* DRUG DETAILS */}

                    <div>

                        <h3 className="text-2xl font-bold drop-shadow-md">

                            {getDrugName(nextDrug)}

                        </h3>


                        <p className="mt-2 text-white/95">

                            ⏰ Scheduled for{" "}

                            <span className="font-bold">

                                {formatTime(
                                    nextDrug.proposed_time ||
                                    nextDrug.scheduled_time
                                )}

                            </span>

                        </p>

                    </div>

                </div>


                {/* DOSE */}

                <div className="rounded-2xl border border-white/20 bg-white/20 px-6 py-4 text-center shadow-xl backdrop-blur-md">

                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">

                        Dose

                    </p>


                    <p className="mt-1 text-2xl font-bold">

                        {getDrugAmount(nextDrug) || "—"}

                    </p>

                </div>

            </div>

        </div>

    </section>

)}


                    {/* EMPTY STATE */}

                    {upcoming.length === 0 && (

                        <section className="rounded-3xl bg-white p-10 text-center shadow-sm">

                            <div className="text-6xl">

                                🎉

                            </div>


                            <h2 className="mt-5 font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                                No Upcoming Drugs

                            </h2>


                            <p className="mx-auto mt-2 max-w-md text-slate-500">

                                There are no pending medicines scheduled
                                after the current time.

                            </p>


                            <div className="mt-6 flex flex-wrap justify-center gap-3">

                                <button
                                    onClick={() =>
                                        setActiveTab("schedules")
                                    }
                                    className="rounded-xl bg-purple-500 px-5 py-3 font-semibold text-white"
                                >
                                    📅 View Schedules
                                </button>


                                <button
                                    onClick={() =>
                                        setActiveTab("intake")
                                    }
                                    className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-white"
                                >
                                    ✅ Record Intake
                                </button>

                            </div>

                        </section>

                    )}


                    {/* UPCOMING LIST */}

                   {upcoming.length > 0 && (

    <section className="rounded-3xl bg-white p-6 shadow-sm">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="flex items-center justify-between gap-4">

            <div>

                <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                    Today's Schedule

                </h2>


                <p className="mt-1 text-sm text-slate-500">

                    {upcoming.length} upcoming{" "}

                    {upcoming.length === 1
                        ? "medicine"
                        : "medicines"
                    }

                    {" "}in{" "}

                    {upcomingTimeGroups.length}{" "}

                    {upcomingTimeGroups.length === 1
                        ? "time"
                        : "time slots"
                    }

                </p>

            </div>

        </div>


        {/* =============================================
            TIME GROUPS
        ============================================= */}

        <div className="mt-6 space-y-6">


            {upcomingTimeGroups.map(
                ([time, medicines]) => {


                    const isCurrentGroupNext =

                        nextDrug &&

                        medicines.some(
                            (medicine) =>

                                String(medicine.id) ===
                                String(nextDrug.id)
                        );


                    return (

                        <div
                            key={time}
                            className={`overflow-hidden rounded-3xl border transition ${
                                isCurrentGroupNext
                                    ? "border-orange-200 bg-orange-50/50"
                                    : "border-slate-100 bg-slate-50/50"
                            }`}
                        >


                            {/* =====================================
                                TIME HEADER
                            ===================================== */}

                            <div
                                className={`flex items-center justify-between px-5 py-4 ${
                                    isCurrentGroupNext
                                        ? "bg-orange-100"
                                        : "bg-slate-100"
                                }`}
                            >


                                <div className="flex items-center gap-3">


                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${
                                            isCurrentGroupNext
                                                ? "bg-orange-500 text-white"
                                                : "bg-white text-slate-600 shadow-sm"
                                        }`}
                                    >

                                        ⏰

                                    </div>


                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                                            Scheduled Time

                                        </p>


                                        <h3 className="text-lg font-bold text-slate-800">

                                            {formatTime(time)}

                                        </h3>

                                    </div>

                                </div>


                                <div className="flex items-center gap-2">


                                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">

                                        {medicines.length}{" "}

                                        {medicines.length === 1
                                            ? "medicine"
                                            : "medicines"
                                        }

                                    </span>


                                    {isCurrentGroupNext && (

                                        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">

                                            NEXT

                                        </span>

                                    )}

                                </div>

                            </div>


                            {/* =====================================
                                MEDICINES IN THIS TIME SLOT
                            ===================================== */}

                            <div className="space-y-2 p-3">


                                {medicines.map(
                                    (record, medicineIndex) => {


                                        const image =
                                            getDrugImage(record);


                                        const isNext =

                                            nextDrug &&

                                            String(record.id) ===
                                            String(nextDrug.id);


                                        return (

                                            <div
                                                key={record.id}
                                                className={`flex items-center justify-between gap-4 rounded-2xl p-4 transition ${
                                                    isNext
                                                        ? "bg-orange-50 ring-1 ring-orange-200"
                                                        : "bg-white hover:bg-slate-50"
                                                }`}
                                            >


                                                {/* =====================
                                                    LEFT
                                                ===================== */}

                                                <div className="flex min-w-0 items-center gap-4">


                                                    {/* IMAGE */}

                                                    {image ? (

                                                        <img
                                                            src={image}
                                                            alt={
                                                                getDrugName(
                                                                    record
                                                                )
                                                            }
                                                            className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm"
                                                        />

                                                    ) : (

                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">

                                                            💊

                                                        </div>

                                                    )}


                                                    {/* DETAILS */}

                                                    <div className="min-w-0">


                                                        <div className="flex flex-wrap items-center gap-2">


                                                            <p className="truncate font-bold text-slate-800">

                                                                💊{" "}

                                                                {
                                                                    getDrugName(
                                                                        record
                                                                    )
                                                                }

                                                            </p>


                                                            {isNext && (

                                                                <span className="rounded-full bg-orange-200 px-2 py-1 text-[10px] font-bold text-orange-700">

                                                                    NEXT

                                                                </span>

                                                            )}

                                                        </div>


                                                        <p className="mt-1 text-sm text-slate-500">

                                                            Take at{" "}

                                                            <span className="font-semibold">

                                                                {
                                                                    formatTime(
                                                                        time
                                                                    )
                                                                }

                                                            </span>

                                                        </p>

                                                    </div>

                                                </div>


                                                {/* =====================
                                                    RIGHT / DOSE
                                                ===================== */}

                                                <div className="shrink-0 text-right">


                                                    <p className="text-lg font-bold text-slate-800">

                                                        {
                                                            getDrugAmount(
                                                                record
                                                            ) || "—"
                                                        }

                                                    </p>


                                                    <p className="mt-1 text-xs text-slate-500">

                                                        Dose{" "}

                                                        {
                                                            record.dose_order ||
                                                            medicineIndex + 1
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        );

                                    }

                                )}

                            </div>

                        </div>

                    );

                }

            )}

        </div>

    </section>

)}
                </div>

            )}


            {/* =================================================
                DRUG PLANS
            ================================================= */}

            {activeTab === "plans" && (

                <div className="space-y-6">


                    {/* ADD PLAN */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                            💊 Add Baby Drug Plan

                        </h2>


                        <form
                            onSubmit={handleAddPlan}
                            className="mt-5 space-y-5"
                        >


                            {/* DRUG SELECTOR */}

                            <div>

                                <FormLabel>
                                    Select Drug
                                </FormLabel>


                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                    {drugs.map((drug) => {

                                        const image =
                                            getDrugImage(drug);

                                        const isSelected =
                                            String(planForm.drug) ===
                                            String(drug.id);


                                        return (

                                            <button
                                                key={drug.id}
                                                type="button"

                                                onClick={() =>
                                                    setPlanForm({
                                                        ...planForm,
                                                        drug:
                                                            String(
                                                                drug.id
                                                            ),
                                                    })
                                                }

                                                className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-sky-500 bg-sky-50 shadow-sm"
                                                        : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50"
                                                }`}
                                            >

                                                {image ? (

                                                    <img
                                                        src={image}
                                                        alt={drug.name}
                                                        className="h-16 w-16 rounded-xl object-cover"
                                                    />

                                                ) : (

                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-3xl">

                                                        💊

                                                    </div>

                                                )}


                                                <div className="min-w-0">

                                                    <p className="font-bold text-slate-800">

                                                        {drug.name}

                                                    </p>


                                                    <p className="mt-1 text-sm capitalize text-slate-500">

                                                        {
                                                            drug.administration_type
                                                        }

                                                    </p>


                                                    {drug.amount && (

                                                        <p className="mt-1 text-xs text-slate-500">

                                                            {drug.amount} {drug.unit}

                                                        </p>

                                                    )}

                                                </div>


                                                {isSelected && (

                                                    <div className="ml-auto text-xl">

                                                        ✓

                                                    </div>

                                                )}

                                            </button>

                                        );

                                    })}

                                </div>


                                {drugs.length === 0 && (

                                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">

                                        No drugs available. Add a drug first.

                                    </p>

                                )}

                            </div>


                            {/* SELECTED DRUG */}

                            {selectedDrug && (

                                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">

                                    <p className="text-sm font-semibold text-sky-700">

                                        ✓ Selected Drug

                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-800">

                                        {selectedDrug.name}

                                    </p>

                                </div>

                            )}


                            <div>

                                <FormLabel>
                                    Times Per Day
                                </FormLabel>

                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={planForm.times_per_day}

                                    onChange={(event) =>
                                        setPlanForm({
                                            ...planForm,
                                            times_per_day:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    Start Date
                                </FormLabel>

                                <input
                                    type="date"
                                    value={planForm.start_date}

                                    onChange={(event) =>
                                        setPlanForm({
                                            ...planForm,
                                            start_date:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    End Date
                                </FormLabel>

                                <input
                                    type="date"
                                    value={planForm.end_date}

                                    onChange={(event) =>
                                        setPlanForm({
                                            ...planForm,
                                            end_date:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    Notes
                                </FormLabel>

                                <textarea
                                    value={planForm.notes}

                                    onChange={(event) =>
                                        setPlanForm({
                                            ...planForm,
                                            notes:
                                                event.target.value,
                                        })
                                    }

                                    className="min-h-28 w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={!planForm.drug}
                                className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Create Drug Plan
                            </button>

                        </form>

                    </section>


                    {/* PLANS LIST */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-[family-name:var(--font-baloo)] text-2xl">

                            Active Drug Plans

                        </h2>


                        <div className="mt-5 space-y-3">

                            {plans.length === 0 ? (

                                <p className="text-slate-500">

                                    No drug plans yet.

                                </p>

                            ) : (

                                plans.map((plan) => {

                                    const drug =
                                        plan.drug_details;

                                    const image =
                                        getDrugImage(drug);


                                    return (

                                        <div
                                            key={plan.id}
                                            className="flex items-center gap-4 rounded-2xl bg-sky-50 p-4"
                                        >

                                            {image ? (

                                                <img
                                                    src={image}
                                                    alt={drug?.name}
                                                    className="h-16 w-16 rounded-xl object-cover"
                                                />

                                            ) : (

                                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl">

                                                    💊

                                                </div>

                                            )}


                                            <div>

                                                <p className="font-bold text-slate-800">

                                                    💊 {drug?.name}

                                                </p>

                                                <p className="mt-1 text-sm text-slate-600">

                                                    {plan.times_per_day} time(s) per day

                                                </p>

                                            </div>

                                        </div>

                                    );

                                })

                            )}

                        </div>

                    </section>

                </div>

            )}


            {/* =================================================
                SCHEDULES
            ================================================= */}

            {activeTab === "schedules" && (

                <div className="space-y-6">


                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-[family-name:var(--font-baloo)] text-2xl">

                            ⏰ Add Drug Schedule

                        </h2>


                        <form
                            onSubmit={handleAddSchedule}
                            className="mt-5 space-y-5"
                        >


                            <div>

                                <FormLabel>
                                    Select Drug Plan
                                </FormLabel>


                                <div className="space-y-3">

                                    {plans.map((plan) => {

                                        const drug =
                                            plan.drug_details;

                                        const image =
                                            getDrugImage(drug);

                                        const isSelected =
                                            String(
                                                scheduleForm.baby_drug_plan
                                            ) === String(plan.id);


                                        return (

                                            <button
                                                key={plan.id}
                                                type="button"

                                                onClick={() =>
                                                    setScheduleForm({
                                                        ...scheduleForm,

                                                        baby_drug_plan:
                                                            String(plan.id),
                                                    })
                                                }

                                                className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-purple-500 bg-purple-50"
                                                        : "border-slate-200 hover:border-purple-300"
                                                }`}
                                            >

                                                {image ? (

                                                    <img
                                                        src={image}
                                                        alt={drug?.name}
                                                        className="h-16 w-16 rounded-xl object-cover"
                                                    />

                                                ) : (

                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl">

                                                        💊

                                                    </div>

                                                )}


                                                <div>

                                                    <p className="font-bold text-slate-800">

                                                        {drug?.name}

                                                    </p>

                                                    <p className="text-sm text-slate-500">

                                                        {plan.times_per_day} times per day

                                                    </p>

                                                </div>


                                                {isSelected && (

                                                    <span className="ml-auto text-xl">

                                                        ✓

                                                    </span>

                                                )}

                                            </button>

                                        );

                                    })}

                                </div>

                            </div>


                            <div>

                                <FormLabel>
                                    Dose Order
                                </FormLabel>

                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={scheduleForm.dose_order}

                                    onChange={(event) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            dose_order:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    Scheduled Time
                                </FormLabel>

                                <input
                                    type="time"
                                    required
                                    value={scheduleForm.scheduled_time}

                                    onChange={(event) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            scheduled_time:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    Amount
                                </FormLabel>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={scheduleForm.amount}

                                    onChange={(event) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            amount:
                                                event.target.value,
                                        })
                                    }

                                    placeholder="Example: 0.6"
                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    Unit
                                </FormLabel>

                                <input
                                    type="text"
                                    value={scheduleForm.unit}

                                    onChange={(event) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            unit:
                                                event.target.value,
                                        })
                                    }

                                    placeholder="Example: mL"
                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={!scheduleForm.baby_drug_plan}
                                className="rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                Add Schedule
                            </button>

                        </form>

                    </section>


                    {/* SCHEDULE LIST */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-[family-name:var(--font-baloo)] text-2xl">

                            📅 Drug Schedules

                        </h2>


                        <div className="mt-5 space-y-3">

                            {schedules.length === 0 ? (

                                <p className="text-slate-500">

                                    No schedules yet.

                                </p>

                            ) : (

                                schedules.map((schedule) => {

                                    const image =
                                        getDrugImage(
                                            schedule.drug_details
                                        );


                                    return (

                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between gap-4 rounded-2xl bg-purple-50 p-4"
                                        >

                                            <div className="flex items-center gap-4">

                                                {image ? (

                                                    <img
                                                        src={image}
                                                        alt={schedule.drug_name}
                                                        className="h-16 w-16 rounded-xl object-cover"
                                                    />

                                                ) : (

                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl">

                                                        💊

                                                    </div>

                                                )}


                                                <div>

                                                    <p className="font-semibold">

                                                        💊 {schedule.drug_name}

                                                    </p>

                                                    <p className="text-sm text-slate-600">

                                                        ⏰ {formatTime(schedule.scheduled_time)}

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="text-right">

                                                <p className="font-semibold">

                                                    {schedule.amount} {schedule.unit}

                                                </p>

                                                <p className="text-xs text-slate-500">

                                                    Dose {schedule.dose_order}

                                                </p>

                                            </div>

                                        </div>

                                    );

                                })

                            )}

                        </div>

                    </section>

                </div>

            )}


            {/* =================================================
                DRUG INTAKE
            ================================================= */}

            {activeTab === "intake" && (

                <div className="space-y-6">


                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-[family-name:var(--font-baloo)] text-2xl">

                            ✅ Record Drug Intake

                        </h2>


                        <form
                            onSubmit={handleAddRecord}
                            className="mt-5 space-y-5"
                        >


                            <div>

                                <FormLabel>
                                    Select Scheduled Drug
                                </FormLabel>


                                <div className="space-y-3">

                                    {schedules.map((schedule) => {

                                        const drug =
                                            schedule.drug_details;

                                        const image =
                                            getDrugImage(drug);

                                        const isSelected =
                                            String(recordForm.schedule) ===
                                            String(schedule.id);


                                        return (

                                            <button
                                                key={schedule.id}
                                                type="button"

                                                onClick={() =>
                                                    setRecordForm({
                                                        ...recordForm,

                                                        schedule:
                                                            String(
                                                                schedule.id
                                                            ),
                                                    })
                                                }

                                                className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-slate-200 hover:border-green-300"
                                                }`}
                                            >

                                                {image ? (

                                                    <img
                                                        src={image}
                                                        alt={schedule.drug_name}
                                                        className="h-16 w-16 rounded-xl object-cover"
                                                    />

                                                ) : (

                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl">

                                                        💊

                                                    </div>

                                                )}


                                                <div>

                                                    <p className="font-bold text-slate-800">

                                                        {schedule.drug_name}

                                                    </p>

                                                    <p className="text-sm text-slate-500">

                                                        ⏰ {formatTime(schedule.scheduled_time)}

                                                    </p>

                                                    <p className="text-sm text-slate-600">

                                                        💉 {schedule.amount} {schedule.unit}

                                                    </p>

                                                </div>


                                                {isSelected && (

                                                    <span className="ml-auto text-xl text-green-600">

                                                        ✓

                                                    </span>

                                                )}

                                            </button>

                                        );

                                    })}

                                </div>

                            </div>


                            <div>

                                <FormLabel>
                                    Intake Date
                                </FormLabel>

                                <input
                                    type="date"
                                    value={recordForm.date}

                                    onChange={(event) =>
                                        setRecordForm({
                                            ...recordForm,
                                            date:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <div>

                                <FormLabel>
                                    Intake Status
                                </FormLabel>

                                <select
                                    value={recordForm.status}

                                    onChange={(event) =>
                                        setRecordForm({
                                            ...recordForm,
                                            status:
                                                event.target.value,
                                        })
                                    }

                                    className="w-full rounded-xl border border-slate-300 p-3"
                                >

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="taken">
                                        Taken
                                    </option>

                                    <option value="missed">
                                        Missed
                                    </option>

                                    <option value="skipped">
                                        Skipped
                                    </option>

                                </select>

                            </div>


                            <div>

                                <FormLabel>
                                    Notes
                                </FormLabel>

                                <textarea
                                    value={recordForm.notes}

                                    onChange={(event) =>
                                        setRecordForm({
                                            ...recordForm,
                                            notes:
                                                event.target.value,
                                        })
                                    }

                                    className="min-h-28 w-full rounded-xl border border-slate-300 p-3"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={!recordForm.schedule}
                                className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                Save Drug Intake
                            </button>

                        </form>

                    </section>


                    {/* RECORDS */}

                    <section className="rounded-3xl bg-white p-6 shadow-sm">

                        <h2 className="font-[family-name:var(--font-baloo)] text-2xl">

                            📋 Drug Intake Records

                        </h2>


                        <div className="mt-5 space-y-3">

                            {records.length === 0 ? (

                                <p className="text-slate-500">

                                    No intake records yet.

                                </p>

                            ) : (

                                records.map((record) => {

                                    const image =
                                        getDrugImage(record);


                                    return (

                                        <div
                                            key={record.id}
                                            className="rounded-2xl bg-green-50 p-4"
                                        >

                                            <div className="flex items-center justify-between gap-4">


                                                <div className="flex items-center gap-4">

                                                    {image ? (

                                                        <img
                                                            src={image}
                                                            alt={record.drug_name}
                                                            className="h-16 w-16 rounded-xl object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl">

                                                            💊

                                                        </div>

                                                    )}


                                                    <div>

                                                        <p className="font-semibold text-slate-800">

                                                            💊 {record.drug_name}

                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-600">

                                                            📅 {record.date}

                                                        </p>


                                                        {record.proposed_time && (

                                                            <p className="text-sm text-slate-500">

                                                                ⏰ {formatTime(record.proposed_time)}

                                                            </p>

                                                        )}

                                                    </div>

                                                </div>


                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                                                        record.status === "taken"
                                                            ? "bg-green-200 text-green-800"
                                                            : record.status === "missed"
                                                            ? "bg-red-200 text-red-800"
                                                            : record.status === "skipped"
                                                            ? "bg-yellow-200 text-yellow-800"
                                                            : "bg-white text-slate-600"
                                                    }`}
                                                >

                                                    {record.status}

                                                </span>

                                            </div>


                                            {record.taken_at && (

                                                <p className="mt-3 text-xs text-slate-500">

                                                    ✅ Taken at:{" "}

                                                    {
                                                        new Date(
                                                            record.taken_at
                                                        ).toLocaleString()
                                                    }

                                                </p>

                                            )}


                                            {record.notes && (

                                                <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-slate-600">

                                                    📝 {record.notes}

                                                </div>

                                            )}

                                        </div>

                                    );

                                })

                            )}

                        </div>

                    </section>

                </div>

            )}


            {/* =================================================
                ADD DRUG
            ================================================= */}

            {activeTab === "add-drug" && (

                <section className="rounded-3xl bg-white p-6 shadow-sm">

                    <h2 className="font-[family-name:var(--font-baloo)] text-2xl">

                        ➕ Add New Drug

                    </h2>


                    <form
                        onSubmit={handleAddDrug}
                        className="mt-5 space-y-5"
                    >


                        {/* IMAGE */}

                        <div>

                            <FormLabel>
                                Drug Image
                            </FormLabel>

                            <input
                                type="file"
                                accept="image/*"

                                onChange={(event) =>
                                    setDrugForm({
                                        ...drugForm,

                                        image:
                                            event.target.files?.[0] ||
                                            null,
                                    })
                                }

                                className="w-full rounded-xl border border-slate-300 p-3"
                            />


                            {drugForm.image && (

                                <img
                                    src={
                                        URL.createObjectURL(
                                            drugForm.image
                                        )
                                    }

                                    alt="Drug preview"

                                    className="mt-4 h-32 w-32 rounded-2xl object-cover shadow-sm"
                                />

                            )}

                        </div>


                        {/* NAME */}

                        <div>

                            <FormLabel>
                                Drug Name
                            </FormLabel>

                            <input
                                type="text"
                                required
                                value={drugForm.name}

                                onChange={(event) =>
                                    setDrugForm({
                                        ...drugForm,
                                        name:
                                            event.target.value,
                                    })
                                }

                                className="w-full rounded-xl border border-slate-300 p-3"
                            />

                        </div>


                        {/* ADMINISTRATION TYPE */}

                        <div>

                            <FormLabel>
                                Administration Type
                            </FormLabel>

                            <select
                                value={
                                    drugForm.administration_type
                                }

                                onChange={(event) =>
                                    setDrugForm({
                                        ...drugForm,

                                        administration_type:
                                            event.target.value,
                                    })
                                }

                                className="w-full rounded-xl border border-slate-300 p-3"
                            >

                                <option value="drops">
                                    Drops
                                </option>

                                <option value="measurement">
                                    Measurement
                                </option>

                                <option value="tablet">
                                    Tablet
                                </option>

                                <option value="capsule">
                                    Capsule
                                </option>

                                <option value="other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* AMOUNT */}

                        <div>

                            <FormLabel>
                                Default Amount
                            </FormLabel>

                            <input
                                type="number"
                                step="0.01"
                                value={drugForm.amount}

                                onChange={(event) =>
                                    setDrugForm({
                                        ...drugForm,
                                        amount:
                                            event.target.value,
                                    })
                                }

                                placeholder="Example: 0.6"

                                className="w-full rounded-xl border border-slate-300 p-3"
                            />

                        </div>


                        {/* UNIT */}

                        <div>

                            <FormLabel>
                                Unit
                            </FormLabel>

                            <input
                                type="text"
                                value={drugForm.unit}

                                onChange={(event) =>
                                    setDrugForm({
                                        ...drugForm,
                                        unit:
                                            event.target.value,
                                    })
                                }

                                placeholder="Example: mL"

                                className="w-full rounded-xl border border-slate-300 p-3"
                            />

                        </div>


                        {/* NOTES */}

                        <div>

                            <FormLabel>
                                Notes
                            </FormLabel>

                            <textarea
                                value={drugForm.notes}

                                onChange={(event) =>
                                    setDrugForm({
                                        ...drugForm,
                                        notes:
                                            event.target.value,
                                    })
                                }

                                className="min-h-28 w-full rounded-xl border border-slate-300 p-3"
                            />

                        </div>


                        <button
                            type="submit"
                            className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white"
                        >
                            Add Drug
                        </button>

                    </form>

                </section>

            )}

        </div>

    );

}