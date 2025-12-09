import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import DraggableBlockList from "../components/workspace/DraggableBlockList";
import EditorToolbar from "../components/workspace/EditorToolbar";
import {
    PlusIcon, SaveIcon, FileTextIcon, TrashIcon,
    ZoomInIcon, ZoomOutIcon, Loader2Icon, FolderOpenIcon, CheckCircleIcon, CloudIcon
} from "lucide-react";
import { useWorkspace, useCreateWorkspace, useUpdateWorkspace } from "../hooks/useWorkspace";

// Generate unique IDs for blocks
const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

function InterviewWorkspacePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get("id");

    // Mutations for save/update
    const createWorkspaceMutation = useCreateWorkspace();
    const updateWorkspaceMutation = useUpdateWorkspace();

    // Load existing workspace if ID is in URL
    const { data: existingWorkspace, isLoading: loadingWorkspace } = useWorkspace(workspaceId);

    // Zoom level (50% to 200%)
    const [zoomLevel, setZoomLevel] = useState(100);

    // Current workspace ID (updates after first save)
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState(workspaceId);

    // Auto-save state
    const [saveStatus, setSaveStatus] = useState("saved"); // "saved", "saving", "unsaved"
    const autoSaveTimerRef = useRef(null);
    const hasUnsavedChanges = useRef(false);
    const isInitialLoad = useRef(true);

    // Block state - each block has id, type, and content
    const [blocks, setBlocks] = useState([
        {
            id: generateId(),
            type: "heading",
            content: "Interview Question",
            level: 1,
        },
        {
            id: generateId(),
            type: "text",
            content: "Write your question description here...",
        },
    ]);

    const [activeBlockId, setActiveBlockId] = useState(null);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
    const [documentTitle, setDocumentTitle] = useState("Untitled Workspace");

    // Load existing workspace data
    useEffect(() => {
        if (existingWorkspace?.workspace) {
            const ws = existingWorkspace.workspace;
            // Mark as initial load to prevent auto-save from triggering
            isInitialLoad.current = true;

            setDocumentTitle(ws.title || "Untitled Workspace");
            setZoomLevel(ws.zoomLevel || 100);
            setCurrentWorkspaceId(ws._id);
            if (ws.blocks && ws.blocks.length > 0) {
                setBlocks(ws.blocks.map(b => ({
                    ...b,
                    id: b.blockId || generateId(),
                })));
            }

            // Reset initial load flag after a short delay to allow state updates
            setTimeout(() => {
                isInitialLoad.current = false;
                setSaveStatus("saved");
            }, 100);
        }
    }, [existingWorkspace]);

    // Zoom functions
    const zoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    }, []);

    const zoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 10, 50));
    }, []);

    // Save workspace (can be called manually or by auto-save)
    const handleSave = useCallback(async (isAutoSave = false) => {
        // Don't auto-save if there's no workspace ID yet (need manual first save)
        if (isAutoSave && !currentWorkspaceId) {
            return;
        }

        setSaveStatus("saving");

        const workspaceData = {
            title: documentTitle,
            blocks: blocks.map(b => ({
                blockId: b.id,
                type: b.type,
                content: b.content,
                level: b.level,
                language: b.language,
                code: b.code,
                testCases: b.testCases,
            })),
            zoomLevel,
        };

        try {
            if (currentWorkspaceId) {
                // Update existing
                await updateWorkspaceMutation.mutateAsync({
                    workspaceId: currentWorkspaceId,
                    data: workspaceData,
                });
                setSaveStatus("saved");
                hasUnsavedChanges.current = false;
                if (!isAutoSave) {
                    toast.success("Workspace saved!");
                }
            } else {
                // Create new (only manual save)
                const result = await createWorkspaceMutation.mutateAsync(workspaceData);
                setCurrentWorkspaceId(result.workspace._id);
                // Update URL with new workspace ID
                navigate(`/workspace?id=${result.workspace._id}`, { replace: true });
                setSaveStatus("saved");
                hasUnsavedChanges.current = false;
                toast.success("Workspace created!");
            }
        } catch (error) {
            setSaveStatus("unsaved");
            if (!isAutoSave) {
                toast.error("Failed to save workspace");
            }
            console.error(error);
        }
    }, [documentTitle, blocks, zoomLevel, currentWorkspaceId, updateWorkspaceMutation, createWorkspaceMutation, navigate]);

    // Trigger auto-save when content changes
    const triggerAutoSave = useCallback(() => {
        if (isInitialLoad.current) return;

        hasUnsavedChanges.current = true;
        setSaveStatus("unsaved");

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer for auto-save
        autoSaveTimerRef.current = setTimeout(() => {
            if (hasUnsavedChanges.current && currentWorkspaceId) {
                handleSave(true);
            }
        }, AUTO_SAVE_DELAY);
    }, [handleSave, currentWorkspaceId]);

    // Watch for changes that should trigger auto-save
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        triggerAutoSave();
    }, [blocks, documentTitle, zoomLevel]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    // Add a new block
    const addBlock = useCallback((type, afterBlockId = null) => {
        const newBlock = {
            id: generateId(),
            type,
            content: "",
            ...(type === "heading" && { level: 2 }),
            ...(type === "code" && {
                language: "javascript",
                code: "// Write your solution here\n",
                testCases: [{ input: "", expectedOutput: "", actualOutput: "", passed: null }],
            }),
        };

        setBlocks((prev) => {
            if (afterBlockId) {
                const index = prev.findIndex((b) => b.id === afterBlockId);
                const newBlocks = [...prev];

                // Clear the slash from the current block if it only contains "/"
                if (newBlocks[index] && (newBlocks[index].content === "/" || newBlocks[index].content.trim() === "/")) {
                    newBlocks[index] = { ...newBlocks[index], content: "" };
                }

                newBlocks.splice(index + 1, 0, newBlock);
                return newBlocks;
            }
            return [...prev, newBlock];
        });

        setActiveBlockId(newBlock.id);
        setShowSlashMenu(false);
    }, []);

    // Update a block's content
    const updateBlock = useCallback((blockId, updates) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId ? { ...block, ...updates } : block
            )
        );
    }, []);

    // Delete a block
    const deleteBlock = useCallback((blockId) => {
        setBlocks((prev) => {
            if (prev.length <= 1) return prev; // Keep at least one block
            return prev.filter((b) => b.id !== blockId);
        });
    }, []);

    // Reorder blocks (for drag and drop)
    const reorderBlocks = useCallback((activeId, overId) => {
        setBlocks((prev) => {
            const oldIndex = prev.findIndex((b) => b.id === activeId);
            const newIndex = prev.findIndex((b) => b.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prev;

            const newBlocks = [...prev];
            const [removed] = newBlocks.splice(oldIndex, 1);
            newBlocks.splice(newIndex, 0, removed);

            return newBlocks;
        });
    }, []);

    // Handle slash command - triggered from BlockContent when "/" is typed
    const handleSlashCommand = useCallback((e, blockId) => {
        if (e.key === "/") {
            const rect = e.target.getBoundingClientRect();
            setSlashMenuPosition({ x: rect.left, y: rect.bottom + 5 });
            setShowSlashMenu(true);
            setActiveBlockId(blockId);
        }
    }, []);

    // Slash menu commands
    const slashCommands = useMemo(() => [
        { id: "text", label: "Text", description: "Plain text paragraph", icon: "📝" },
        { id: "heading", label: "Heading", description: "Large section heading", icon: "📌" },
        { id: "code", label: "Code Block", description: "Write and run code", icon: "💻" },
        { id: "bullet", label: "Bullet List", description: "Create a bullet list", icon: "•" },
        { id: "numbered", label: "Numbered List", description: "Create a numbered list", icon: "1." },
    ], []);

    // Clear workspace
    const clearWorkspace = useCallback(() => {
        if (confirm("Are you sure you want to clear the workspace?")) {
            setBlocks([
                {
                    id: generateId(),
                    type: "heading",
                    content: "Interview Question",
                    level: 1,
                },
            ]);
            setDocumentTitle("Untitled Workspace");
        }
    }, []);

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            <Navbar />

            {/* Workspace Header */}
            <div className="bg-base-100 border-b border-base-300 px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <FileTextIcon className="size-6 text-primary" />
                        <input
                            type="text"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                            placeholder="Untitled Workspace"
                        />

                        {/* Save Status Indicator */}
                        <div className="flex items-center gap-1.5 text-sm">
                            {saveStatus === "saving" && (
                                <>
                                    <Loader2Icon className="size-4 animate-spin text-base-content/50" />
                                    <span className="text-base-content/50">Saving...</span>
                                </>
                            )}
                            {saveStatus === "saved" && currentWorkspaceId && (
                                <>
                                    <CheckCircleIcon className="size-4 text-success" />
                                    <span className="text-success">Saved</span>
                                </>
                            )}
                            {saveStatus === "unsaved" && (
                                <>
                                    <CloudIcon className="size-4 text-warning" />
                                    <span className="text-warning">Unsaved</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1 border border-base-300 rounded-lg px-2 py-1">
                            <button
                                onClick={zoomOut}
                                disabled={zoomLevel <= 50}
                                className="btn btn-ghost btn-xs"
                                title="Zoom out"
                            >
                                <ZoomOutIcon className="size-4" />
                            </button>
                            <span className="text-sm font-mono w-12 text-center">{zoomLevel}%</span>
                            <button
                                onClick={zoomIn}
                                disabled={zoomLevel >= 200}
                                className="btn btn-ghost btn-xs"
                                title="Zoom in"
                            >
                                <ZoomInIcon className="size-4" />
                            </button>
                        </div>

                        <div className="divider divider-horizontal mx-0"></div>

                        <button
                            onClick={clearWorkspace}
                            className="btn btn-ghost btn-sm gap-2 text-error"
                        >
                            <TrashIcon className="size-4" />
                            Clear
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saveStatus === "saving"}
                            className="btn btn-primary btn-sm gap-2"
                        >
                            {saveStatus === "saving" ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="size-4" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Toolbar */}
            <EditorToolbar
                onAddBlock={addBlock}
                activeBlockId={activeBlockId}
                updateBlock={updateBlock}
                blocks={blocks}
                zoomLevel={zoomLevel}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
            />

            {/* Main Editor Area */}
            {loadingWorkspace ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2Icon className="size-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-base-content/60">Loading workspace...</p>
                    </div>
                </div>
            ) : (
                <div
                    className="flex-1 container mx-auto px-4 py-8 max-w-4xl transition-transform origin-top"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                    <DraggableBlockList
                        blocks={blocks}
                        activeBlockId={activeBlockId}
                        setActiveBlockId={setActiveBlockId}
                        updateBlock={updateBlock}
                        deleteBlock={deleteBlock}
                        reorderBlocks={reorderBlocks}
                        addBlock={addBlock}
                        onSlashCommand={handleSlashCommand}
                    />

                    {/* Add Block Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => addBlock("text")}
                            className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content"
                        >
                            <PlusIcon className="size-4" />
                            Add Block
                        </button>
                    </div>
                </div>
            )}

            {/* Slash Command Menu */}
            {showSlashMenu && (
                <div
                    className="fixed bg-base-100 border border-base-300 rounded-lg shadow-xl z-50 p-2 min-w-64"
                    style={{ left: slashMenuPosition.x, top: slashMenuPosition.y }}
                >
                    <div className="text-xs text-base-content/50 px-3 py-2 font-medium">
                        BASIC BLOCKS
                    </div>
                    {slashCommands.map((cmd) => (
                        <button
                            key={cmd.id}
                            onClick={() => addBlock(cmd.id, activeBlockId)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
                        >
                            <span className="text-xl">{cmd.icon}</span>
                            <div>
                                <div className="font-medium text-sm">{cmd.label}</div>
                                <div className="text-xs text-base-content/60">{cmd.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Click outside to close slash menu */}
            {showSlashMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSlashMenu(false)}
                />
            )}
        </div>
    );
}

export default InterviewWorkspacePage;
