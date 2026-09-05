"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const [babyId, setBabyId] = useState("");
    const [error, setError] = useState("");


    function handleSubmit(event) {
        event.preventDefault();

        const trimmedBabyId = babyId.trim();

        if (!trimmedBabyId) {
            setError("Please enter the baby's unique ID.");
            return;
        }

        setError("");

        router.push(
            `/babies/${encodeURIComponent(trimmedBabyId)}`
        );
    }


    return (
        <main className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 px-4 py-8">

            <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center">

                {/* Logo / Icon */}

                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-lg">
                    🍼
                </div>


                {/* Heading */}

                <div className="text-center">

                    <h1 className="font-[family-name:var(--font-baloo)] text-4xl text-slate-800 sm:text-5xl">
                        Baby Glucose Tracker
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                        Keep track of your baby's glucose readings safely and
                        easily before feeding.
                    </p>

                </div>


                {/* Access Card */}

                <section className="mt-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">

                    <div className="text-center">

                        <div className="text-3xl">
                            🔐
                        </div>

                        <h2 className="mt-3 font-[family-name:var(--font-baloo)] text-2xl text-slate-800">
                            Open Baby Records
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Enter your baby's unique ID to view their glucose
                            readings.
                        </p>

                    </div>


                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6"
                    >

                        <label
                            htmlFor="babyId"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Baby Unique ID
                        </label>


                        <input
                            id="babyId"
                            type="text"
                            value={babyId}
                            onChange={(event) => {
                                setBabyId(event.target.value);
                                setError("");
                            }}
                            placeholder="Enter baby ID"
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        />


                        {/* Error */}

                        {error && (

                            <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>

                        )}


                        {/* Submit Button */}

                        <button
                            type="submit"
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-4 font-semibold text-white shadow-sm transition hover:bg-sky-600 hover:shadow-md active:scale-[0.98]"
                        >
                            <span>
                                View Baby Records
                            </span>

                            <span className="text-lg">
                                →
                            </span>
                        </button>

                    </form>

                </section>


                {/* Footer */}

                <p className="mt-8 text-center text-sm text-slate-500">
                    🩵 Made with care for your little one
                </p>

            </div>

        </main>
    );
}