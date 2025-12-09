import { useState, useRef, useEffect, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, TrashIcon, PlusIcon } from "lucide-react";
import CodeExecutionBlock from "./CodeExecutionBlock";

// Sortable Block Wrapper
function SortableBlock({
    block,
    isActive,
    onFocus,
    updateBlock,
    deleteBlock,
    addBlock,
    onKeyDown
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-start gap-2 py-2 rounded-lg transition-all ${isActive ? "bg-base-200/50" : "hover:bg-base-200/30"
                }`}
            onClick={() => onFocus(block.id)}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 mt-1"
            >
                <GripVerticalIcon className="size-4 text-base-content/40" />
            </div>

            {/* Block Content */}
            <div className="flex-1 min-w-0">
                <BlockContent
                    block={block}
                    updateBlock={updateBlock}
                    onKeyDown={onKeyDown}
                    isActive={isActive}
                />
            </div>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addBlock("text", block.id);
                    }}
                    className="p-1 hover:bg-base-300 rounded"
                    title="Add block below"
                >
                    <PlusIcon className="size-4 text-base-content/40" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                    }}
                    className="p-1 hover:bg-error/20 rounded"
                    title="Delete block"
                >
                    <TrashIcon className="size-4 text-error/60" />
                </button>
            </div>
        </div>
    );
}

// Block Content Renderer
function BlockContent({ block, updateBlock, onKeyDown, isActive }) {
    const contentRef = useRef(null);
    const isInitialized = useRef(false);

    // Set initial content only once on mount
    useEffect(() => {
        if (contentRef.current && !isInitialized.current) {
            contentRef.current.innerText = block.content || "";
            isInitialized.current = true;
        }
    }, []);

    // Update content when block.content changes externally (e.g., after slash command clears it)
    useEffect(() => {
        if (contentRef.current && isInitialized.current) {
            // Only update if content was cleared externally (like after slash command)
            if (block.content === "" && contentRef.current.innerText !== "") {
                contentRef.current.innerText = "";
            }
        }
    }, [block.content]);

    // Focus management
    useEffect(() => {
        if (isActive && contentRef.current && block.type !== "code") {
            contentRef.current.focus();
        }
    }, [isActive, block.type]);

    // Handle input - detect slash command here for immediate response
    const handleInput = useCallback((e) => {
        const text = e.target.innerText;
        updateBlock(block.id, { content: text });

        // Check if user typed just "/" - trigger slash command menu
        if (text === "/" || text.trim() === "/") {
            onKeyDown?.({ key: "/", target: e.target }, block.id);
        }
    }, [block.id, updateBlock, onKeyDown]);

    // Handle key events
    const handleKeyDown = useCallback((e) => {
        // Enter to add new block
        if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
            e.preventDefault();
            // Could add new block here
        }

        // Backspace on empty content with just "/" - close menu
        if (e.key === "Backspace" && contentRef.current?.innerText === "/") {
            // Let it delete normally, menu will close
        }
    }, [block.type]);

    switch (block.type) {
        case "heading":
            const HeadingTag = `h${block.level || 1}`;
            const headingSizes = {
                1: "text-3xl font-bold",
                2: "text-2xl font-semibold",
                3: "text-xl font-medium",
            };
            return (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    dir="ltr"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    className={`${headingSizes[block.level || 1]} outline-none focus:ring-0 min-h-[1em] text-base-content`}
                    data-placeholder="Heading..."
                />
            );

        case "text":
            return (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    dir="ltr"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    className="text-base outline-none focus:ring-0 min-h-[1.5em] text-base-content leading-relaxed"
                    data-placeholder="Type '/' for commands..."
                />
            );

        case "code":
            return (
                <CodeExecutionBlock
                    block={block}
                    updateBlock={updateBlock}
                    isActive={isActive}
                />
            );

        case "bullet":
            return (
                <div className="flex items-start gap-2">
                    <span className="text-base-content/60 mt-0.5">•</span>
                    <div
                        ref={contentRef}
                        contentEditable
                        suppressContentEditableWarning
                        dir="ltr"
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        className="flex-1 text-base outline-none focus:ring-0 min-h-[1.5em] text-base-content"
                        data-placeholder="List item..."
                    />
                </div>
            );

        case "numbered":
            return (
                <div className="flex items-start gap-2">
                    <span className="text-base-content/60 mt-0.5 min-w-[1.5em]">1.</span>
                    <div
                        ref={contentRef}
                        contentEditable
                        suppressContentEditableWarning
                        dir="ltr"
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        className="flex-1 text-base outline-none focus:ring-0 min-h-[1.5em] text-base-content"
                        data-placeholder="List item..."
                    />
                </div>
            );

        default:
            return (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    dir="ltr"
                    onInput={handleInput}
                    className="text-base outline-none focus:ring-0 min-h-[1.5em] text-base-content"
                />
            );
    }
}

// Main Draggable Block List
function DraggableBlockList({
    blocks,
    activeBlockId,
    setActiveBlockId,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    addBlock,
    onSlashCommand,
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            reorderBlocks(active.id, over.id);
        }
    }, [reorderBlocks]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-1">
                    {blocks.map((block) => (
                        <SortableBlock
                            key={block.id}
                            block={block}
                            isActive={activeBlockId === block.id}
                            onFocus={setActiveBlockId}
                            updateBlock={updateBlock}
                            deleteBlock={deleteBlock}
                            addBlock={addBlock}
                            onKeyDown={onSlashCommand}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

export default DraggableBlockList;
