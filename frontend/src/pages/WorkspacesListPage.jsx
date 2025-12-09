import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
    PlusIcon, FileTextIcon, Loader2Icon, TrashIcon,
    SearchIcon, GridIcon, ListIcon, ClockIcon
} from "lucide-react";
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from "../hooks/useWorkspace";

function WorkspacesListPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all workspaces
    const { data, isLoading, error } = useWorkspaces();
    const workspaces = data?.workspaces || [];

    // Create new workspace
    const createMutation = useCreateWorkspace();
    const deleteMutation = useDeleteWorkspace();

    // Filter workspaces by search
    const filteredWorkspaces = workspaces.filter(ws =>
        ws.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create new blank workspace
    const handleCreateNew = async () => {
        try {
            const result = await createMutation.mutateAsync({
                title: "Untitled Workspace",
                blocks: [
                    {
                        blockId: `block_${Date.now()}`,
                        type: "heading",
                        content: "Interview Question",
                        level: 1,
                    },
                ],
            });
            navigate(`/workspace?id=${result.workspace._id}`);
            toast.success("New workspace created!");
        } catch (error) {
            toast.error("Failed to create workspace");
        }
    };

    // Delete workspace
    const handleDelete = async (e, workspaceId) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm("Are you sure you want to delete this workspace?")) {
            try {
                await deleteMutation.mutateAsync(workspaceId);
                toast.success("Workspace deleted!");
            } catch (error) {
                toast.error("Failed to delete workspace");
            }
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            <Navbar />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-base-300">
                <div className="container mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold mb-2">My Workspaces</h1>
                    <p className="text-base-content/60">
                        Create and manage your interview workspaces
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-base-100 border-b border-base-300 sticky top-[68px] z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Create New Button */}
                        <button
                            onClick={handleCreateNew}
                            disabled={createMutation.isPending}
                            className="btn btn-primary gap-2"
                        >
                            {createMutation.isPending ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                                <PlusIcon className="size-4" />
                            )}
                            New Workspace
                        </button>

                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
                                <input
                                    type="text"
                                    placeholder="Search workspaces..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input input-bordered w-full pl-10"
                                />
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 border border-base-300 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-ghost"}`}
                            >
                                <GridIcon className="size-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-ghost"}`}
                            >
                                <ListIcon className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2Icon className="size-10 animate-spin mx-auto text-primary" />
                            <p className="mt-4 text-base-content/60">Loading your workspaces...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-error">Failed to load workspaces</p>
                        <p className="text-base-content/60 mt-2">{error.message}</p>
                    </div>
                ) : filteredWorkspaces.length === 0 ? (
                    <div className="text-center py-20">
                        {searchQuery ? (
                            <>
                                <SearchIcon className="size-12 mx-auto text-base-content/30" />
                                <p className="mt-4 text-lg">No workspaces found</p>
                                <p className="text-base-content/60">Try a different search term</p>
                            </>
                        ) : (
                            <>
                                <FileTextIcon className="size-16 mx-auto text-base-content/30" />
                                <p className="mt-4 text-xl font-medium">No workspaces yet</p>
                                <p className="text-base-content/60 mt-2">
                                    Create your first workspace to get started
                                </p>
                                <button
                                    onClick={handleCreateNew}
                                    className="btn btn-primary mt-6 gap-2"
                                >
                                    <PlusIcon className="size-4" />
                                    Create Workspace
                                </button>
                            </>
                        )}
                    </div>
                ) : viewMode === "grid" ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* New Workspace Card */}
                        <button
                            onClick={handleCreateNew}
                            className="group border-2 border-dashed border-base-300 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] hover:border-primary hover:bg-primary/5 transition-all"
                        >
                            <div className="size-14 rounded-full bg-base-200 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                <PlusIcon className="size-7 text-base-content/40 group-hover:text-primary" />
                            </div>
                            <span className="mt-4 font-medium text-base-content/60 group-hover:text-primary">
                                Blank Workspace
                            </span>
                        </button>

                        {/* Workspace Cards */}
                        {filteredWorkspaces.map((workspace) => (
                            <Link
                                key={workspace._id}
                                to={`/workspace?id=${workspace._id}`}
                                className="group bg-base-100 border border-base-300 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
                            >
                                {/* Preview Area */}
                                <div className="h-32 bg-gradient-to-br from-primary/5 to-secondary/5 p-4 border-b border-base-300">
                                    <div className="text-sm text-base-content/60 line-clamp-4">
                                        {workspace.blocks?.[0]?.content || "Empty workspace"}
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                                                {workspace.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-base-content/50">
                                                <ClockIcon className="size-3" />
                                                <span>{formatDate(workspace.updatedAt)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, workspace._id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-error/10 rounded-lg transition-all"
                                            title="Delete workspace"
                                        >
                                            <TrashIcon className="size-4 text-error" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Last Modified</th>
                                    <th>Blocks</th>
                                    <th className="w-16"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWorkspaces.map((workspace) => (
                                    <tr
                                        key={workspace._id}
                                        className="hover:bg-base-200 cursor-pointer"
                                        onClick={() => navigate(`/workspace?id=${workspace._id}`)}
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <FileTextIcon className="size-5 text-primary" />
                                                <span className="font-medium">{workspace.title}</span>
                                            </div>
                                        </td>
                                        <td className="text-base-content/60">
                                            {formatDate(workspace.updatedAt)}
                                        </td>
                                        <td className="text-base-content/60">
                                            {workspace.blocks?.length || 0} blocks
                                        </td>
                                        <td>
                                            <button
                                                onClick={(e) => handleDelete(e, workspace._id)}
                                                className="btn btn-ghost btn-sm text-error"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkspacesListPage;
