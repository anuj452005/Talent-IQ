import {
    BoldIcon,
    ItalicIcon,
    ListIcon,
    ListOrderedIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    CodeIcon,
    PlusIcon,
    TypeIcon,
} from "lucide-react";

function EditorToolbar({ onAddBlock, activeBlockId, updateBlock, blocks }) {
    // Find active block
    const activeBlock = blocks?.find((b) => b.id === activeBlockId);

    // Block insertion buttons
    const insertButtons = [
        { id: "text", label: "Text", icon: TypeIcon },
        { id: "heading", label: "Heading", icon: Heading1Icon },
        { id: "code", label: "Code", icon: CodeIcon },
        { id: "bullet", label: "Bullet List", icon: ListIcon },
        { id: "numbered", label: "Numbered List", icon: ListOrderedIcon },
    ];

    // Heading level buttons
    const headingLevels = [
        { level: 1, icon: Heading1Icon, label: "H1" },
        { level: 2, icon: Heading2Icon, label: "H2" },
        { level: 3, icon: Heading3Icon, label: "H3" },
    ];

    // Change heading level
    const changeHeadingLevel = (level) => {
        if (activeBlock && activeBlock.type === "heading") {
            updateBlock(activeBlockId, { level });
        }
    };

    return (
        <div className="sticky top-0 z-30 bg-base-100 border-b border-base-300 shadow-sm">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="flex items-center gap-2 py-2 overflow-x-auto">
                    {/* Insert Block Dropdown */}
                    <div className="dropdown dropdown-bottom">
                        <label tabIndex={0} className="btn btn-sm btn-ghost gap-2">
                            <PlusIcon className="size-4" />
                            Insert
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300"
                        >
                            {insertButtons.map((btn) => {
                                const Icon = btn.icon;
                                return (
                                    <li key={btn.id}>
                                        <button onClick={() => onAddBlock(btn.id, activeBlockId)}>
                                            <Icon className="size-4" />
                                            {btn.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="divider divider-horizontal mx-1"></div>

                    {/* Heading Levels - Only show when heading is selected */}
                    {activeBlock?.type === "heading" && (
                        <>
                            <div className="flex items-center gap-1">
                                {headingLevels.map(({ level, icon: Icon, label }) => (
                                    <button
                                        key={level}
                                        onClick={() => changeHeadingLevel(level)}
                                        className={`btn btn-sm btn-ghost ${activeBlock.level === level ? "btn-active" : ""
                                            }`}
                                        title={label}
                                    >
                                        <Icon className="size-4" />
                                    </button>
                                ))}
                            </div>
                            <div className="divider divider-horizontal mx-1"></div>
                        </>
                    )}

                    {/* Quick Insert Buttons */}
                    <div className="flex items-center gap-1">
                        {insertButtons.map((btn) => {
                            const Icon = btn.icon;
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => onAddBlock(btn.id, activeBlockId)}
                                    className="btn btn-sm btn-ghost"
                                    title={`Add ${btn.label}`}
                                >
                                    <Icon className="size-4" />
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex-1"></div>

                    {/* Keyboard Shortcut Hint */}
                    <div className="text-xs text-base-content/50 hidden md:block">
                        Type <kbd className="kbd kbd-xs">/</kbd> for commands
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditorToolbar;
