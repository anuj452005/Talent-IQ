import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) return savedTheme;

            // Check system preference
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                return "dark";
            }
        }
        return "dark"; // default to dark
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle swap swap-rotate"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
                <MoonIcon className="w-5 h-5 text-slate-600" />
            )}
        </button>
    );
}

export default ThemeToggle;
