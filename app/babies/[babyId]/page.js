import AddReading from "./AddReading";
import GlucoseChart from "./GlucoseChart";
import GlucoseReadings from "./GlucoseReadings";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getBaby(babyId) {
    const response = await fetch(
        `${API_URL}/babies/${babyId}/`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Baby not found");
    }

    return response.json();
}


async function getReadings(babyId) {
    const response = await fetch(
        `${API_URL}/babies/${babyId}/readings/`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Could not load glucose readings");
    }

    return response.json();
}


export default async function BabyPage({ params }) {
    const { babyId } = await params;

    const baby = await getBaby(babyId);
    const readings = await getReadings(babyId);

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


           <div className="mb-6 grid gap-6 lg:grid-cols-3">

    {/* Baby Information - Left */}
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


    {/* Latest Reading - Right */}
    {readings.length > 0 && (

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

    )}

</div>
<GlucoseChart readings={readings} />

                {/* Add Reading */}
                <section className="mb-8">
                    <AddReading babyId={baby.baby_id} />
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