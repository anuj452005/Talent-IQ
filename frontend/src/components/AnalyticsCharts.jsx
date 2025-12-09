import { useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { BarChart3Icon, PieChartIcon, TrendingUpIcon, CalendarIcon } from "lucide-react";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function AnalyticsCharts({ sessions = [] }) {
    // Calculate analytics data
    const analytics = useMemo(() => {
        const difficultyCount = { easy: 0, medium: 0, hard: 0 };
        const monthlyActivity = {};
        const problemsSolved = new Set();
        let totalDuration = 0;

        sessions.forEach((session) => {
            // Difficulty breakdown
            if (session.difficulty) {
                difficultyCount[session.difficulty.toLowerCase()] =
                    (difficultyCount[session.difficulty.toLowerCase()] || 0) + 1;
            }

            // Monthly activity
            if (session.createdAt) {
                const date = new Date(session.createdAt);
                const monthKey = date.toLocaleDateString("en-US", { month: "short" });
                monthlyActivity[monthKey] = (monthlyActivity[monthKey] || 0) + 1;
            }

            // Unique problems
            if (session.problem) {
                problemsSolved.add(session.problem);
            }
        });

        return {
            difficultyCount,
            monthlyActivity,
            totalSessions: sessions.length,
            uniqueProblems: problemsSolved.size,
            avgPerMonth: sessions.length > 0
                ? Math.round(sessions.length / Math.max(Object.keys(monthlyActivity).length, 1))
                : 0,
        };
    }, [sessions]);

    // Difficulty Doughnut Chart Data
    const difficultyData = {
        labels: ["Easy", "Medium", "Hard"],
        datasets: [
            {
                data: [
                    analytics.difficultyCount.easy,
                    analytics.difficultyCount.medium,
                    analytics.difficultyCount.hard,
                ],
                backgroundColor: [
                    "rgba(34, 197, 94, 0.8)",  // green
                    "rgba(234, 179, 8, 0.8)",   // yellow
                    "rgba(239, 68, 68, 0.8)",   // red
                ],
                borderColor: [
                    "rgba(34, 197, 94, 1)",
                    "rgba(234, 179, 8, 1)",
                    "rgba(239, 68, 68, 1)",
                ],
                borderWidth: 2,
            },
        ],
    };

    // Activity Bar Chart Data
    const activityLabels = Object.keys(analytics.monthlyActivity).slice(-6);
    const activityData = {
        labels: activityLabels.length > 0 ? activityLabels : ["Jan", "Feb", "Mar"],
        datasets: [
            {
                label: "Sessions",
                data: activityLabels.map((m) => analytics.monthlyActivity[m] || 0),
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 20,
                    usePointStyle: true,
                },
            },
        },
        cutout: "65%",
    };

    return (
        <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <TrendingUpIcon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Performance Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Stats Cards */}
                <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <div className="card-body p-4">
                        <div className="text-3xl font-bold text-primary">{analytics.totalSessions}</div>
                        <div className="text-sm opacity-70">Total Sessions</div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20">
                    <div className="card-body p-4">
                        <div className="text-3xl font-bold text-secondary">{analytics.uniqueProblems}</div>
                        <div className="text-sm opacity-70">Unique Problems</div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
                    <div className="card-body p-4">
                        <div className="text-3xl font-bold text-accent">{analytics.avgPerMonth}</div>
                        <div className="text-sm opacity-70">Avg per Month</div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
                    <div className="card-body p-4">
                        <div className="text-3xl font-bold text-success">
                            {Math.round((analytics.difficultyCount.hard / Math.max(analytics.totalSessions, 1)) * 100)}%
                        </div>
                        <div className="text-sm opacity-70">Hard Problems</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Difficulty Breakdown */}
                <div className="card bg-base-100 border border-base-300">
                    <div className="card-body">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChartIcon className="w-5 h-5 text-primary" />
                            <h3 className="font-bold">Difficulty Breakdown</h3>
                        </div>
                        <div className="h-64">
                            {analytics.totalSessions > 0 ? (
                                <Doughnut data={difficultyData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-base-content/50">
                                    No session data yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Monthly Activity */}
                <div className="card bg-base-100 border border-base-300">
                    <div className="card-body">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3Icon className="w-5 h-5 text-secondary" />
                            <h3 className="font-bold">Monthly Activity</h3>
                        </div>
                        <div className="h-64">
                            {analytics.totalSessions > 0 ? (
                                <Bar data={activityData} options={chartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-base-content/50">
                                    No activity data yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsCharts;
