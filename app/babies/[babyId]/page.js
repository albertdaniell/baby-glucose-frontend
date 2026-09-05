import BabyTabs from "./BabyTabs";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


/* =====================================================
   GET BABY
===================================================== */

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

            return {
                data: null,
                error: `Could not load baby. Server returned ${response.status}.`,
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
            error: `Connection error: ${error.message}`,
        };

    }

}



/* =====================================================
   GET GLUCOSE READINGS
===================================================== */

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
                error: `Could not load glucose readings. Server returned ${response.status}.`,
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



/* =====================================================
   DYNAMIC METADATA
===================================================== */

export async function generateMetadata({ params }) {

    const { babyId } = await params;

    const babyResult = await getBaby(babyId);


    if (babyResult.error || !babyResult.data) {

        return {

            title: "Baby Not Found | Baby Health Tracker",

            description:
                "Baby health records could not be loaded.",

        };

    }


    const baby = babyResult.data;


    return {

        title: `${baby.name} | Baby Health Tracker`,

        description: `View glucose and medicine records for ${baby.name}.`,

        openGraph: {

            title: `${baby.name} | Baby Health Tracker`,

            description:
                `View glucose readings and medicine records for ${baby.name}.`,

        },

    };

}



/* =====================================================
   BABY PAGE
===================================================== */

export default async function BabyPage({ params }) {

    const { babyId } = await params;


    /* GET BABY */

    const babyResult = await getBaby(babyId);



    /* =========================================
       ERROR PAGE
    ========================================== */

    if (babyResult.error || !babyResult.data) {

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

                        {babyResult.error || "Baby could not be found."}

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



    /* =========================================
       BABY DATA
    ========================================== */

    const baby = babyResult.data;



    /* =========================================
       GLUCOSE READINGS
    ========================================== */

    const readingsResult = await getReadings(babyId);

    const readings = readingsResult.data || [];



    /* =========================================
       MAIN PAGE
    ========================================== */

    return (

        <main className="min-h-screen bg-gradient-to-br from-sky-100 via-pink-50 to-purple-100">


            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">


                {/* HEADER */}

                <div className="mb-8">


                    <p className="mb-2 text-sm font-medium text-blue-600">

                        Baby Health Records

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



                {/* TABS */}

                <BabyTabs
                    baby={baby}
                    readings={readings}
                    readingsError={readingsResult.error}
                />


            </div>


        </main>

    );

}