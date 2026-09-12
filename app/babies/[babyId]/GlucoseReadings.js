"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useRouter } from "next/navigation";


const API_URL =
    process.env.NEXT_PUBLIC_API_URL;


const ALLOWED_EMAILS = [
    "albertagoya@gmail.com",
    "daisyoyuga@gmail.com",
];


const PARENT_EMAIL_STORAGE_KEY =
    "baby_records_parent_email";


export default function GlucoseReadings({
    readings = [],
    babyId,
}) {

    const router =
        useRouter();


    // =========================
    // DATE NAVIGATION
    // =========================

    const [activeDate, setActiveDate] =
        useState(null);


    const dateRefs =
        useRef({});


    // =========================
    // AUTHORIZATION STATE
    // =========================

    const [authorizedEmail, setAuthorizedEmail] =
        useState(null);


    // =========================
    // EDIT STATES
    // =========================

    const [selectedReading, setSelectedReading] =
        useState(null);


    const [isEditing, setIsEditing] =
        useState(false);


    const [value, setValue] =
        useState("");


    const [date, setDate] =
        useState("");


    const [time, setTime] =
        useState("");


    const [notes, setNotes] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    // =========================
    // DELETE STATES
    // =========================

    const [readingToDelete, setReadingToDelete] =
        useState(null);


    const [isDeleting, setIsDeleting] =
        useState(false);


    const [deleteError, setDeleteError] =
        useState("");


    // =========================
    // EMAIL VERIFICATION STATES
    // =========================

    const [emailModal, setEmailModal] =
        useState(null);


    const [pendingReading, setPendingReading] =
        useState(null);


    const [parentEmail, setParentEmail] =
        useState("");


    const [emailError, setEmailError] =
        useState("");


    // =========================
    // LOAD SAVED EMAIL
    // =========================

    useEffect(() => {

        const savedEmail =
            localStorage.getItem(
                PARENT_EMAIL_STORAGE_KEY
            );


        if (!savedEmail) {
            return;
        }


        const normalizedEmail =
            savedEmail
                .trim()
                .toLowerCase();


        if (
            ALLOWED_EMAILS.includes(
                normalizedEmail
            )
        ) {

            setAuthorizedEmail(
                normalizedEmail
            );

        } else {

            localStorage.removeItem(
                PARENT_EMAIL_STORAGE_KEY
            );

        }

    }, []);


    // =========================
    // GROUP READINGS BY DATE
    // =========================

    const groupedReadings =
        useMemo(() => {

            const groups = {};


            readings.forEach(
                (reading) => {

                    const readingDate =
                        reading.measured_date;


                    if (!readingDate) {
                        return;
                    }


                    if (!groups[readingDate]) {

                        groups[readingDate] = [];

                    }


                    groups[readingDate].push(
                        reading
                    );

                }
            );


            return Object.entries(groups)

                // Newest date first

                .sort(
                    ([dateA], [dateB]) => {

                        return (
                            new Date(
                                `${dateB}T00:00:00`
                            ) -
                            new Date(
                                `${dateA}T00:00:00`
                            )
                        );

                    }
                )

                .map(
                    ([
                        readingDate,
                        dateReadings,
                    ]) => {


                        // Sort by newest time first

                        const sortedReadings =
                            [...dateReadings].sort(
                                (a, b) => {

                                    return (
                                        String(
                                            b.measured_time || ""
                                        ).localeCompare(
                                            String(
                                                a.measured_time || ""
                                            )
                                        )
                                    );

                                }
                            );


                        // Calculate average

                        const total =
                            dateReadings.reduce(
                                (
                                    sum,
                                    reading
                                ) => {

                                    return (
                                        sum +
                                        Number(
                                            reading.value || 0
                                        )
                                    );

                                },
                                0
                            );


                        const average =
                            dateReadings.length > 0
                                ? total /
                                dateReadings.length
                                : 0;


                        return {

                            date:
                                readingDate,

                            readings:
                                sortedReadings,

                            average,

                            totalReadings:
                                dateReadings.length,

                        };

                    }
                );

        }, [readings]);


    // =========================
    // SET INITIAL ACTIVE DATE
    // =========================

    useEffect(() => {

        if (
            groupedReadings.length > 0 &&
            !activeDate
        ) {

            setActiveDate(
                groupedReadings[0].date
            );

        }

    }, [
        groupedReadings,
        activeDate,
    ]);


    // =========================
    // DETECT ACTIVE DATE
    // =========================

    useEffect(() => {

        if (
            groupedReadings.length === 0
        ) {
            return;
        }


        const observer =
            new IntersectionObserver(

                (entries) => {

                    const visibleEntries =
                        entries.filter(
                            (entry) =>
                                entry.isIntersecting
                        );


                    if (
                        visibleEntries.length === 0
                    ) {
                        return;
                    }


                    const mostVisible =
                        visibleEntries.reduce(
                            (
                                previous,
                                current
                            ) => {

                                return current.intersectionRatio >
                                    previous.intersectionRatio
                                    ? current
                                    : previous;

                            }
                        );


                    const visibleDate =
                        mostVisible.target.dataset.date;


                    if (visibleDate) {

                        setActiveDate(
                            visibleDate
                        );

                    }

                },

                {

                    root: null,

                    threshold: [
                        0.1,
                        0.25,
                        0.5,
                        0.75,
                    ],

                    rootMargin:
                        "-120px 0px -45% 0px",

                }

            );


        const elements =
            Object.values(
                dateRefs.current
            );


        elements.forEach(
            (element) => {

                if (element) {

                    observer.observe(
                        element
                    );

                }

            }
        );


        return () => {

            observer.disconnect();

        };

    }, [groupedReadings]);


    // =========================
    // FORMAT DATE
    // =========================

    function formatDate(
        readingDate
    ) {

        if (!readingDate) {
            return "";
        }


        const dateObject =
            new Date(
                `${readingDate}T00:00:00`
            );


        return dateObject.toLocaleDateString(
            undefined,
            {

                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric",

            }
        );

    }


    // =========================
    // FORMAT SHORT DATE
    // =========================

    function formatShortDate(
        readingDate
    ) {

        if (!readingDate) {
            return "";
        }


        const dateObject =
            new Date(
                `${readingDate}T00:00:00`
            );


        return dateObject.toLocaleDateString(
            undefined,
            {

                month:
                    "short",

                day:
                    "numeric",

            }
        );

    }


    // =========================
    // SCROLL TO DATE
    // =========================

    function scrollToDate(
        readingDate
    ) {

        const element =
            dateRefs.current[
                readingDate
            ];


        if (!element) {
            return;
        }


        setActiveDate(
            readingDate
        );


        element.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start",

        });

    }


    // =========================
    // EMAIL AUTHORIZATION
    // =========================

    function requestAuthorization(
        action,
        reading
    ) {

        if (authorizedEmail) {

            if (
                action === "edit"
            ) {

                openEditModal(
                    reading
                );

            }


            if (
                action === "delete"
            ) {

                openDeleteModal(
                    reading
                );

            }


            return;

        }


        setPendingReading(
            reading
        );


        setParentEmail(
            ""
        );


        setEmailError(
            ""
        );


        setEmailModal(
            action
        );

    }


    function closeEmailModal() {

        setEmailModal(
            null
        );


        setPendingReading(
            null
        );


        setParentEmail(
            ""
        );


        setEmailError(
            ""
        );

    }


    function verifyEmail() {

        const email =
            parentEmail
                .trim()
                .toLowerCase();


        if (
            !ALLOWED_EMAILS.includes(
                email
            )
        ) {

            setEmailError(
                "This email is not authorized to edit or delete readings."
            );

            return;

        }


        localStorage.setItem(

            PARENT_EMAIL_STORAGE_KEY,

            email

        );


        setAuthorizedEmail(
            email
        );


        const action =
            emailModal;


        const reading =
            pendingReading;


        closeEmailModal();


        if (
            action === "edit"
        ) {

            openEditModal(
                reading
            );

        }


        if (
            action === "delete"
        ) {

            openDeleteModal(
                reading
            );

        }

    }


    // =========================
    // EDIT FUNCTIONS
    // =========================

    function openEditModal(
        reading
    ) {

        setSelectedReading(
            reading
        );


        setValue(
            reading.value ?? ""
        );


        setDate(
            reading.measured_date ?? ""
        );


        setTime(
            reading.measured_time ?? ""
        );


        setNotes(
            reading.notes || ""
        );


        setError(
            ""
        );


        setIsEditing(
            true
        );

    }


    function closeEditModal() {

        if (loading) {
            return;
        }


        setIsEditing(
            false
        );


        setSelectedReading(
            null
        );


        setError(
            ""
        );

    }


    async function handleUpdate(
        event
    ) {

        event.preventDefault();


        if (!selectedReading) {
            return;
        }


        setLoading(
            true
        );


        setError(
            ""
        );


        try {

            const response =
                await fetch(

                    `${API_URL}/babies/${babyId}/readings/${selectedReading.id}/`,

                    {

                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json",

                        },

                        body:
                            JSON.stringify({

                                value:
                                    Number(value),

                                date,

                                time,

                                notes,

                            }),

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    data
                );


                setError(
                    "Could not update the glucose reading."
                );

                return;

            }


            setIsEditing(
                false
            );


            setSelectedReading(
                null
            );


            router.refresh();


        } catch (error) {

            console.error(
                error
            );


            setError(
                "Something went wrong. Please try again."
            );


        } finally {

            setLoading(
                false
            );

        }

    }


    // =========================
    // DELETE FUNCTIONS
    // =========================

    function openDeleteModal(
        reading
    ) {

        setReadingToDelete(
            reading
        );


        setDeleteError(
            ""
        );

    }


    function closeDeleteModal() {

        if (isDeleting) {
            return;
        }


        setReadingToDelete(
            null
        );


        setDeleteError(
            ""
        );

    }


    async function handleDelete() {

        if (!readingToDelete) {
            return;
        }


        setIsDeleting(
            true
        );


        setDeleteError(
            ""
        );


        try {

            const response =
                await fetch(

                    `${API_URL}/babies/${babyId}/readings/${readingToDelete.id}/`,

                    {

                        method:
                            "DELETE",

                    }

                );


            if (!response.ok) {

                setDeleteError(
                    "Could not delete the glucose reading."
                );

                return;

            }


            setReadingToDelete(
                null
            );


            router.refresh();


        } catch (error) {

            console.error(
                error
            );


            setDeleteError(
                "Something went wrong. Please try again."
            );


        } finally {

            setIsDeleting(
                false
            );

        }

    }


    // =========================
    // COMPONENT
    // =========================

    return (

        <>

            {/* ========================= */}
            {/* GLUCOSE READINGS */}
            {/* ========================= */}

            <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <div className="border-b border-slate-100 p-6">

                    <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                        Glucose Readings 🩸

                    </h2>


                    <p className="mt-1 text-sm text-slate-500">

                        Daily glucose readings and averages

                    </p>

                </div>


                {/* ========================= */}
                {/* EMPTY STATE */}
                {/* ========================= */}

                {readings.length === 0 ? (

                    <div className="p-10 text-center">

                        <div className="mb-3 text-4xl">

                            🍼

                        </div>


                        <p className="text-slate-500">

                            No glucose readings recorded yet.

                        </p>

                    </div>

                ) : (

                    <>


                        {/* ========================================= */}
                        {/* MOBILE DATE NAVIGATION */}
                        {/* ========================================= */}

                        <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">

                            <div className="overflow-x-auto">

                                <div className="flex w-max gap-2 pr-4">


                                    {groupedReadings.map(
                                        (group) => {

                                            const isActive =
                                                activeDate ===
                                                group.date;


                                            return (

                                                <button
                                                    key={group.date}
                                                    type="button"
                                                    onClick={() =>
                                                        scrollToDate(
                                                            group.date
                                                        )
                                                    }
                                                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                                        isActive
                                                            ? "bg-sky-500 text-white shadow-sm"
                                                            : "bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700"
                                                    }`}
                                                >

                                                    {formatShortDate(
                                                        group.date
                                                    )}

                                                </button>

                                            );

                                        }
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* ========================================= */}
                        {/* CONTENT + DESKTOP MENU */}
                        {/* ========================================= */}

                        <div className="relative">


                            {/* ========================= */}
                            {/* DESKTOP DATE MENU */}
                            {/* ========================= */}

                            <aside className="absolute right-4 top-6 z-20 hidden w-36 lg:block">

                                <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">


                                    <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">

                                        Jump to date

                                    </p>


                                    <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">


                                        {groupedReadings.map(
                                            (group) => {

                                                const isActive =
                                                    activeDate ===
                                                    group.date;


                                                return (

                                                    <button
                                                        key={group.date}
                                                        type="button"
                                                        onClick={() =>
                                                            scrollToDate(
                                                                group.date
                                                            )
                                                        }
                                                        className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                                                            isActive
                                                                ? "bg-sky-500 text-white"
                                                                : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                                                        }`}
                                                    >

                                                        {formatShortDate(
                                                            group.date
                                                        )}

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                </div>

                            </aside>


                            {/* ========================= */}
                            {/* DATE GROUPS */}
                            {/* ========================= */}

                            <div className="space-y-8 p-5 lg:pr-44">


                                {groupedReadings.map(
                                    (group) => (

                                        <div
                                            key={group.date}
                                            ref={(element) => {

                                                if (element) {

                                                    dateRefs.current[
                                                        group.date
                                                    ] = element;

                                                }

                                            }}
                                            data-date={
                                                group.date
                                            }
                                            className="scroll-mt-24"
                                        >


                                            {/* ========================= */}
                                            {/* DATE HEADER */}
                                            {/* ========================= */}

                                            <div className="mb-4">

                                                <h3 className="text-lg font-bold text-slate-800">

                                                    {formatDate(
                                                        group.date
                                                    )}

                                                </h3>

                                            </div>


                                            {/* ========================= */}
                                            {/* DAILY SUMMARY */}
                                            {/* ========================= */}

                                            <div className="mb-4 grid grid-cols-2 gap-3">


                                                {/* Average */}

                                                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-sky-600">

                                                        Daily Average

                                                    </p>


                                                    <div className="mt-2 flex items-baseline gap-1">

                                                        <span className="text-3xl font-bold text-slate-800">

                                                            {group.average.toFixed(
                                                                2
                                                            )}

                                                        </span>


                                                        <span className="text-sm text-slate-500">

                                                            mmol/L

                                                        </span>

                                                    </div>

                                                </div>


                                                {/* Total */}

                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">

                                                        Readings

                                                    </p>


                                                    <div className="mt-2 flex items-baseline gap-1">

                                                        <span className="text-3xl font-bold text-slate-800">

                                                            {group.totalReadings}

                                                        </span>


                                                        <span className="text-sm text-slate-500">

                                                            recorded

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ========================= */}
                                            {/* READINGS LIST */}
                                            {/* ========================= */}

                                            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">


                                                {group.readings.map(
                                                    (reading) => (

                                                        <div
                                                            key={reading.id}
                                                            className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-b-0 transition hover:bg-sky-50"
                                                        >


                                                            {/* LEFT */}

                                                            <div className="min-w-0">


                                                                <div className="flex items-baseline gap-2">

                                                                    <span className="text-2xl font-bold text-slate-800">

                                                                        {reading.value}

                                                                    </span>


                                                                    <span className="text-sm text-slate-500">

                                                                        mmol/L

                                                                    </span>

                                                                </div>


                                                                <div className="mt-1 text-sm text-slate-500 sm:hidden">

                                                                    {reading.measured_time}

                                                                </div>


                                                                {reading.notes && (

                                                                    <p className="mt-1 truncate text-sm text-slate-500">

                                                                        {reading.notes}

                                                                    </p>

                                                                )}

                                                            </div>


                                                            {/* RIGHT */}

                                                            <div className="flex items-center gap-4">


                                                                <div className="hidden text-right text-sm sm:block">

                                                                    <p className="font-medium text-slate-700">

                                                                        {reading.measured_time}

                                                                    </p>

                                                                </div>


                                                                <div className="flex gap-2">


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            requestAuthorization(
                                                                                "edit",
                                                                                reading
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-200"
                                                                    >

                                                                        Edit

                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            requestAuthorization(
                                                                                "delete",
                                                                                reading
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                                                                    >

                                                                        Delete

                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </>

                )}

            </section>


            {/* ========================= */}
            {/* EMAIL VERIFICATION MODAL */}
            {/* ========================= */}

            {emailModal && (

                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4"
                    onClick={closeEmailModal}
                >

                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl">

                            🔐

                        </div>


                        <div className="mt-5 text-center">

                            <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                                Parent Verification

                            </h2>


                            <p className="mt-2 text-sm leading-6 text-slate-500">

                                Please enter the parent's email address.
                                Once verified, it will be remembered on this device.

                            </p>

                        </div>


                        <div className="mt-6">

                            <label className="mb-2 block text-sm font-medium text-slate-700">

                                Parent Email

                            </label>


                            <input
                                type="email"
                                value={parentEmail}
                                onChange={(event) => {

                                    setParentEmail(
                                        event.target.value
                                    );

                                    setEmailError("");

                                }}
                                onKeyDown={(event) => {

                                    if (
                                        event.key === "Enter"
                                    ) {

                                        verifyEmail();

                                    }

                                }}
                                placeholder="parent@email.com"
                                autoFocus
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                            />

                        </div>


                        {emailError && (

                            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">

                                {emailError}

                            </div>

                        )}


                        <div className="mt-6 flex gap-3">

                            <button
                                type="button"
                                onClick={closeEmailModal}
                                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                onClick={verifyEmail}
                                className="flex-1 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600"
                            >

                                Continue

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* EDIT MODAL */}
            {/* ========================= */}

            {isEditing && selectedReading && (

                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
                    onClick={closeEditModal}
                >

                    <div
                        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="mb-6 flex items-center justify-between">

                            <div>

                                <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                                    Edit Reading ✏️

                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    Update the glucose reading details.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={loading}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                            >

                                ×

                            </button>

                        </div>


                        <form
                            onSubmit={handleUpdate}
                            className="space-y-5"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">

                                    Glucose Value

                                </label>


                                <div className="relative">

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(event) =>
                                            setValue(
                                                event.target.value
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />


                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">

                                        mmol/L

                                    </span>

                                </div>

                            </div>


                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">

                                        Date

                                    </label>


                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(event) =>
                                            setDate(
                                                event.target.value
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">

                                        Time

                                    </label>


                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(event) =>
                                            setTime(
                                                event.target.value
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">

                                    Notes

                                    <span className="ml-1 font-normal text-slate-400">

                                        (Optional)

                                    </span>

                                </label>


                                <textarea
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(
                                            event.target.value
                                        )
                                    }
                                    rows="3"
                                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                />

                            </div>


                            {error && (

                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">

                                    {error}

                                </div>

                            )}


                            <div className="flex gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* DELETE MODAL */}
            {/* ========================= */}

            {readingToDelete && (

                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4"
                    onClick={closeDeleteModal}
                >

                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">

                            🗑️

                        </div>


                        <div className="mt-5 text-center">

                            <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">

                                Delete Reading?

                            </h2>


                            <p className="mt-2 text-sm leading-6 text-slate-500">

                                Are you sure you want to delete this glucose
                                reading? This action cannot be undone.

                            </p>


                            <div className="mt-5 rounded-2xl bg-sky-50 p-4">

                                <p className="text-2xl font-bold text-slate-800">

                                    {readingToDelete.value}

                                    <span className="ml-2 text-sm font-normal text-slate-500">

                                        mmol/L

                                    </span>

                                </p>


                                <p className="mt-1 text-sm text-slate-500">

                                    {readingToDelete.measured_date}

                                    {" • "}

                                    {readingToDelete.measured_time}

                                </p>

                            </div>


                            {deleteError && (

                                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">

                                    {deleteError}

                                </div>

                            )}


                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {isDeleting
                                        ? "Deleting..."
                                        : "Yes, Delete"}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}