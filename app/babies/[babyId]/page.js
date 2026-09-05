import AddReading from "./AddReading";
import GlucoseChart from "./GlucoseChart";
import GlucoseReadings from "./GlucoseReadings";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


async function getBaby(babyId) {
    try {
        if (!API_URL) {
            return {
                data: null,
                error: "The API connection is not configured.",
            };
        }

        const response = await fetch(
            `${API_URL}/babies/${babyId}/`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    data: null,
                    error: "We could not find a baby with that unique ID.",
                };
            }

            return {
                data: null,
                error: "Could not load the baby's information.",
            };
        }

        const data = await response.json();

        return {
            data,
            error: null,
        };

    } catch (error) {
        console.error("Get baby error:", error);

        return {
            data: null,
            error: "Unable to connect to the server. Please try again later.",
        };
    }
}


async function getReadings(babyId) {
    try {
        if (!API_URL) {
            return {
                data: [],
                error: "The API connection is not configured.",
            };
        }

        const response = await fetch(
            `${API_URL}/babies/${babyId}/readings/`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return {
                data: [],
                error: "Could not load glucose readings.",
            };
        }

        const data = await response.json();

        return {
            data,
            error: null,
        };

    } catch (error) {
        console.error("Get readings error:", error);

        return {
            data: [],
            error: "Unable to load glucose readings. Please try again later.",
        };
    }
}


export default async function BabyPage({ params }) {
    const { babyId } = await params;

    const babyResult = await getBaby(babyId);

    /*
        If baby cannot be loaded,
        show a friendly UI instead of throwing an error.
    */
    if (babyResult.error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-pink-50 to-purple-100 px-4">

                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">

                    <div className="mb-5 text-6xl">
                        🍼
                    </div>

                    <h1 className="font-[family-name:var(--font-baloo)] text-3xl text-slate-800">
                        Oops!
                    </h1>

                    <p className="mt-3 text-slate-600">
                        {babyResult.error}
                    </p>

                    <div className="mt-6 rounded-2xl bg-sky-50 p-4">

                        <p className="text-sm text-slate-500">
                            Baby ID
                        </p>

                        <p className="mt-1 break-all font-semibold text-slate-800">
                            {babyId}
                        </p>

                    </div>

                    <a
                        href="/baby"
                        className="mt-6 inline-flex rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-600"
                    >
                        ← Go Back
                    </a>

                </div>

            </main>
        );
    }


    const baby = babyResult.data;


    /*
        Get readings separately.

        Even if readings fail, we can still show
        the baby's information.
    */
    const readingsResult = await getReadings(babyId);

    const readings = readingsResult.data || [];


    return (
        <main className="min-h-screen bg-gradient-to-br from-sky-100 via-pink-50 to-purple-100">

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">

                    <p className="mb-2 text-sm font-medium text-blue-600">
                        Baby Glucose Records
                    </p>

                    <h1 className="font-[family-name:var(--font-baloo)] text-4xl text-slate-800">
                        {baby.name}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Baby ID:{" "}

                        <span className="font-semibold text-slate-700">
                            {baby.baby_id}
                        </span>
                    </p>

                </div>


                {/* Show readings error without breaking the page */}
                {readingsResult.error && (

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
                                    {readingsResult.error}
                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* Baby Info + Latest Reading */}
                <div className="mb-6 grid gap-6 lg:grid-cols-3">


                    {/* Baby Information */}
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

                        </div>

                    </section>


                    {/* Latest Reading */}
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


                {/* Chart */}

                {readings.length > 0 && (
                    <GlucoseChart readings={readings} />
                )}


                {/* Add Reading */}

                <section className="mb-8">

                    <AddReading
                        babyId={baby.baby_id}
                    />

                </section>


                {/* Readings */}

                <GlucoseReadings
                    readings={readings}
                    babyId={baby.baby_id}
                />

            </div>

        </main>
    );
}