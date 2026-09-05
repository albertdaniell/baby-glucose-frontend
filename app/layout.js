import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
    subsets: ["latin"],
    variable: "--font-baloo",
});

const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
});

export const metadata = {
    title: "Baby Glucose Tracker",
    description: "Track baby glucose readings",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${baloo.variable} ${nunito.variable}`}
            >
                {children}
            </body>
        </html>
    );
}