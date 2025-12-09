import { useState } from "react";
import { XIcon, PlusIcon, Code2Icon, Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const CATEGORY_OPTIONS = [
    "Array",
    "String",
    "Hash Table",
    "Two Pointers",
    "Binary Search",
    "Dynamic Programming",
    "Recursion",
    "Graph",
    "Tree",
    "Stack",
    "Queue",
    "Linked List",
    "Math",
    "Greedy",
];

function CreateProblemModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "Medium",
        categories: [],
        description: "",
        examples: "",
        constraints: "",
        hints: ["", "", ""],
        starterCode: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCategoryToggle = (category) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter((c) => c !== category)
                : [...prev.categories, category],
        }));
    };

    const handleHintChange = (index, value) => {
        setFormData((prev) => {
            const newHints = [...prev.hints];
            newHints[index] = value;
            return { ...prev, hints: newHints };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            toast.error("Title and description are required");
            return;
        }

        setIsSubmitting(true);

        // For now, store in localStorage (could be extended to backend)
        try {
            const customProblems = JSON.parse(localStorage.getItem("customProblems") || "[]");
            const newProblem = {
                id: `custom-${Date.now()}`,
                title: formData.title,
                difficulty: formData.difficulty,
                category: formData.categories.join(" • "),
                description: {
                    text: formData.description,
                    notes: [],
                },
                examples: formData.examples
                    .split("\n\n")
                    .filter(Boolean)
                    .map((ex) => ({ input: ex, output: "" })),
                constraints: formData.constraints.split("\n").filter(Boolean),
                hints: formData.hints.filter(Boolean),
                starterCode: {
                    javascript: formData.starterCode || `// Your solution here\n\nfunction solution() {\n  \n}`,
                },
                isCustom: true,
                createdAt: new Date().toISOString(),
            };

            customProblems.push(newProblem);
            localStorage.setItem("customProblems", JSON.stringify(customProblems));

            toast.success("Problem created successfully!");
            onClose();
            setFormData({
                title: "",
                difficulty: "Medium",
                categories: [],
                description: "",
                examples: "",
                constraints: "",
                hints: ["", "", ""],
                starterCode: "",
            });
        } catch (error) {
            toast.error("Failed to create problem");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-base-100 flex items-center justify-between px-6 py-4 border-b border-base-300 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Code2Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Create Custom Problem</h2>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Problem Title *</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="e.g., Two Sum"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Difficulty</span>
                        </label>
                        <div className="flex gap-2">
                            {DIFFICULTY_OPTIONS.map((diff) => (
                                <button
                                    key={diff}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, difficulty: diff })}
                                    className={`btn btn-sm ${formData.difficulty === diff
                                            ? diff === "Easy"
                                                ? "btn-success"
                                                : diff === "Medium"
                                                    ? "btn-warning"
                                                    : "btn-error"
                                            : "btn-outline"
                                        }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Categories (select multiple)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryToggle(cat)}
                                    className={`badge badge-lg cursor-pointer ${formData.categories.includes(cat) ? "badge-primary" : "badge-outline"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Problem Description *</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-32"
                            placeholder="Describe the problem clearly..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    {/* Examples */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Examples</span>
                            <span className="label-text-alt">Separate examples with blank lines</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-24"
                            placeholder="Input: nums = [2,7,11,15], target = 9&#10;Output: [0,1]"
                            value={formData.examples}
                            onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                        />
                    </div>

                    {/* Constraints */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Constraints</span>
                            <span className="label-text-alt">One per line</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-20"
                            placeholder="2 ≤ nums.length ≤ 10⁴&#10;-10⁹ ≤ nums[i] ≤ 10⁹"
                            value={formData.constraints}
                            onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                        />
                    </div>

                    {/* Progressive Hints */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Progressive Hints</span>
                            <span className="label-text-alt">From subtle to more direct</span>
                        </label>
                        <div className="space-y-2">
                            {[0, 1, 2].map((index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="badge badge-sm">{index + 1}</span>
                                    <input
                                        type="text"
                                        className="input input-bordered input-sm flex-1"
                                        placeholder={
                                            index === 0
                                                ? "Subtle hint..."
                                                : index === 1
                                                    ? "More specific hint..."
                                                    : "Direct hint..."
                                        }
                                        value={formData.hints[index]}
                                        onChange={(e) => handleHintChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Starter Code */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Starter Code (JavaScript)</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-32 font-mono text-sm"
                            placeholder="function solution(input) {&#10;  // Your code here&#10;}"
                            value={formData.starterCode}
                            onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 gap-2">
                            {isSubmitting ? (
                                <>
                                    <Loader2Icon className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    Create Problem
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateProblemModal;
