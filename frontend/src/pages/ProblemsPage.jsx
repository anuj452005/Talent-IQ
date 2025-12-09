import { useState, useMemo } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { PROBLEMS } from "../data/problems";
import {
  ChevronRightIcon,
  Code2Icon,
  FilterIcon,
  SearchIcon,
  PlusIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import CreateProblemModal from "../components/CreateProblemModal";

function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const problems = Object.values(PROBLEMS);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    problems.forEach((p) => {
      if (p.category) {
        // Split by bullet or comma
        p.category.split(/[•,]/).forEach((c) => cats.add(c.trim()));
      }
    });
    return ["all", ...Array.from(cats).sort()];
  }, [problems]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Search filter
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description?.text?.toLowerCase().includes(searchQuery.toLowerCase());

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        problem.category?.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedCategory]);

  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
            <p className="text-base-content/70">
              Sharpen your coding skills with these curated problems
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Problem
          </button>
        </div>

        {/* FILTERS */}
        <div className="card bg-base-100 mb-6">
          <div className="card-body p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5 text-base-content/50" />
                <select
                  className="select select-bordered"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy ({easyCount})</option>
                  <option value="medium">Medium ({mediumCount})</option>
                  <option value="hard">Hard ({hardCount})</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-base-content/50" />
                <select
                  className="select select-bordered"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedDifficulty !== "all" || selectedCategory !== "all" || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {searchQuery && (
                  <span className="badge badge-primary gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")}>
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDifficulty !== "all" && (
                  <span className="badge badge-secondary gap-1">
                    {selectedDifficulty}
                    <button onClick={() => setSelectedDifficulty("all")}>
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="badge badge-accent gap-1">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")}>
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDifficulty("all");
                    setSelectedCategory("all");
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS COUNT */}
        <p className="text-sm text-base-content/60 mb-4">
          Showing {filteredProblems.length} of {problems.length} problems
        </p>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="card bg-base-100 p-12 text-center">
              <Code2Icon className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No problems found</h3>
              <p className="text-base-content/60">Try adjusting your filters</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.id}`}
                className="card bg-base-100 hover:scale-[1.01] transition-transform"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Code2Icon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">{problem.title}</h2>
                            <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-base-content/60">{problem.category}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-base-content/80 mb-3">{problem.description?.text}</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="font-medium">Solve</span>
                      <ChevronRightIcon className="size-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{easyCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{mediumCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Problem Modal */}
      <CreateProblemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

export default ProblemsPage;
