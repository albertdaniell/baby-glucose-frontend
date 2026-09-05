"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ALLOWED_EMAILS = [
    "albertagoya@gmail.com",
    "daisyoyuga@gmail.com",
];


function getCurrentDate() {
    const now = new Date();

    return now.toISOString().split("T")[0];
}


function getCurrentTime() {
    const now = new Date();

    return now.toTimeString().slice(0, 5);
}


export default function AddReading({ babyId }) {
    const router = useRouter();

    // =========================
    // ADD READING MODAL
    // =========================

    const [isOpen, setIsOpen] = useState(false);

    // =========================
    // EMAIL VERIFICATION MODAL
    // =========================

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [parentEmail, setParentEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    // =========================
    // FORM STATES
    // =========================

    const [value, setValue] = useState("");
    const [date, setDate] = useState(getCurrentDate);
    const [time, setTime] = useState(getCurrentTime);
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =========================
    // OPEN EMAIL VERIFICATION
    // =========================

    function openEmailModal() {
        setParentEmail("");
        setEmailError("");
        setIsEmailModalOpen(true);
    }


    function closeEmailModal() {
        setIsEmailModalOpen(false);
        setParentEmail("");
        setEmailError("");
    }


    // =========================
    // VERIFY EMAIL
    // =========================

    function verifyEmail() {
        const email = parentEmail.trim().toLowerCase();

        if (!email) {
            setEmailError("Please enter a parent email address.");
            return;
        }

        if (!ALLOWED_EMAILS.includes(email)) {
            setEmailError(
                "This email is not authorized to add glucose readings."
            );

            return;
        }

        closeEmailModal();
        openModal();
    }


    // =========================
    // OPEN ADD READING MODAL
    // =========================

    function openModal() {
        setDate(getCurrentDate());
        setTime(getCurrentTime());
        setError("");
        setIsOpen(true);
    }


    function closeModal() {
        if (loading) return;

        setIsOpen(false);
        setError("");
    }


    // =========================
    // SAVE READING
    // =========================

    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/babies/${babyId}/readings/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        value: Number(value),
                        date: date,
                        time: time,
                        notes: notes,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(data);
                setError("Could not save glucose reading.");
                return;
            }

            // Reset form
            setValue("");
            setNotes("");

            // Close modal
            setIsOpen(false);

            // Refresh readings
            router.refresh();

        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {/* ========================= */}
            {/* FLOATING ADD BUTTON */}
            {/* ========================= */}

            <button
                onClick={openEmailModal}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-sky-600 active:scale-95"
            >
                <span className="text-2xl leading-none">
                    +
                </span>

                <span>
                    Add Reading
                </span>
            </button>


            {/* ========================= */}
            {/* EMAIL VERIFICATION MODAL */}
            {/* ========================= */}

            {isEmailModalOpen && (

                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4"
                    onClick={closeEmailModal}
                >

                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Icon */}

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl">
                            🔐
                        </div>


                        {/* Header */}

                        <div className="mt-5 text-center">

                            <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">
                                Parent Verification
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Please enter the email address of the baby's
                                parent to add a glucose reading.
                            </p>

                        </div>


                        {/* Email Input */}

                        <div className="mt-6">

                            <label
                                htmlFor="parent-email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Parent Email
                            </label>


                            <input
                                id="parent-email"
                                type="email"
                                value={parentEmail}
                                onChange={(event) => {
                                    setParentEmail(event.target.value);
                                    setEmailError("");
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        verifyEmail();
                                    }
                                }}
                                placeholder="parent@email.com"
                                autoFocus
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                            />

                        </div>


                        {/* Email Error */}

                        {emailError && (

                            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {emailError}
                            </div>

                        )}


                        {/* Buttons */}

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
            {/* ADD READING MODAL */}
            {/* ========================= */}

            {isOpen && (

                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
                    onClick={closeModal}
                >

                    <div
                        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Modal Header */}

                        <div className="mb-6 flex items-center justify-between">

                            <div>

                                <h2 className="font-[family-name:var(--font-baloo)] text-2xl text-slate-800">
                                    Add Glucose Reading 🩸
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Record the glucose level before feeding.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={loading}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Glucose Value */}

                            <div>

                                <label
                                    htmlFor="value"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Glucose Value
                                </label>


                                <div className="relative">

                                    <input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(event) =>
                                            setValue(event.target.value)
                                        }
                                        placeholder="e.g. 4.5"
                                        required
                                        autoFocus
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />


                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                        mmol/L
                                    </span>

                                </div>

                            </div>


                            {/* Date and Time */}

                            <div className="grid grid-cols-2 gap-4">


                                {/* Date */}

                                <div>

                                    <label
                                        htmlFor="date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Date
                                    </label>


                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(event) =>
                                            setDate(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />

                                </div>


                                {/* Time */}

                                <div>

                                    <label
                                        htmlFor="time"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Time
                                    </label>


                                    <input
                                        id="time"
                                        type="time"
                                        value={time}
                                        onChange={(event) =>
                                            setTime(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />

                                </div>

                            </div>


                            {/* Notes */}

                            <div>

                                <label
                                    htmlFor="notes"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Notes

                                    <span className="ml-1 font-normal text-slate-400">
                                        (Optional)
                                    </span>

                                </label>


                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    placeholder="Add any notes..."
                                    rows="3"
                                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                />

                            </div>


                            {/* Error */}

                            {error && (

                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>

                            )}


                            {/* Buttons */}

                            <div className="flex gap-3 pt-2">


                                <button
                                    type="button"
                                    onClick={closeModal}
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
                                        : "Save Reading"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </>
    );
}