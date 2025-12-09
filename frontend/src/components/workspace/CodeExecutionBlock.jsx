import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { executeCode } from "../../lib/piston";
import { LANGUAGE_CONFIG } from "../../data/problems";
import {
    PlayIcon,
    Loader2Icon,
    CheckCircleIcon,
    XCircleIcon,
    PlusIcon,
    TrashIcon,
    CodeIcon,
    TerminalIcon,
} from "lucide-react";

function CodeExecutionBlock({ block, updateBlock, isActive }) {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState(null);
    const [activeTab, setActiveTab] = useState("code"); // 'code' | 'testcases' | 'output'

    // Run code
    const handleRunCode = useCallback(async () => {
        setIsRunning(true);
        setOutput(null);
        setActiveTab("output");

        try {
            const result = await executeCode(block.language || "javascript", block.code || "");
            setOutput(result);

            // Check test cases if any
            if (block.testCases && block.testCases.length > 0) {
                const updatedTestCases = block.testCases.map((tc) => {
                    if (tc.expectedOutput && result.output) {
                        const normalizedActual = result.output.trim();
                        const normalizedExpected = tc.expectedOutput.trim();
                        return {
                            ...tc,
                            actualOutput: normalizedActual,
                            passed: normalizedActual === normalizedExpected,
                        };
                    }
                    return { ...tc, actualOutput: result.output || "", passed: null };
                });
                updateBlock(block.id, { testCases: updatedTestCases });
            }
        } catch (error) {
            setOutput({ success: false, error: error.message });
        } finally {
            setIsRunning(false);
        }
    }, [block, updateBlock]);

    // Update code
    const handleCodeChange = useCallback((value) => {
        updateBlock(block.id, { code: value || "" });
    }, [block.id, updateBlock]);

    // Update language
    const handleLanguageChange = useCallback((e) => {
        const lang = e.target.value;
        updateBlock(block.id, {
            language: lang,
            code: `// Write your ${LANGUAGE_CONFIG[lang]?.name || lang} solution here\n`,
        });
    }, [block.id, updateBlock]);

    // Add test case
    const addTestCase = useCallback(() => {
        const newTestCases = [
            ...(block.testCases || []),
            { input: "", expectedOutput: "", actualOutput: "", passed: null },
        ];
        updateBlock(block.id, { testCases: newTestCases });
    }, [block.id, block.testCases, updateBlock]);

    // Update test case
    const updateTestCase = useCallback((index, field, value) => {
        const newTestCases = [...(block.testCases || [])];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        updateBlock(block.id, { testCases: newTestCases });
    }, [block.id, block.testCases, updateBlock]);

    // Remove test case
    const removeTestCase = useCallback((index) => {
        const newTestCases = block.testCases.filter((_, i) => i !== index);
        updateBlock(block.id, { testCases: newTestCases });
    }, [block.id, block.testCases, updateBlock]);

    // Count passed/failed tests
    const testResults = block.testCases?.reduce(
        (acc, tc) => {
            if (tc.passed === true) acc.passed++;
            if (tc.passed === false) acc.failed++;
            return acc;
        },
        { passed: 0, failed: 0 }
    ) || { passed: 0, failed: 0 };

    return (
        <div className={`rounded-xl border ${isActive ? "border-primary/50" : "border-base-300"} bg-base-100 overflow-hidden shadow-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-base-200/50 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <CodeIcon className="size-5 text-primary" />
                    <select
                        value={block.language || "javascript"}
                        onChange={handleLanguageChange}
                        className="select select-sm select-bordered"
                    >
                        {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                            <option key={key} value={key}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    {/* Test Results Badge */}
                    {(testResults.passed > 0 || testResults.failed > 0) && (
                        <div className="flex items-center gap-2 text-sm">
                            {testResults.passed > 0 && (
                                <span className="flex items-center gap-1 text-success">
                                    <CheckCircleIcon className="size-4" />
                                    {testResults.passed}
                                </span>
                            )}
                            {testResults.failed > 0 && (
                                <span className="flex items-center gap-1 text-error">
                                    <XCircleIcon className="size-4" />
                                    {testResults.failed}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Run Button */}
                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        {isRunning ? (
                            <>
                                <Loader2Icon className="size-4 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="size-4" />
                                Run Code
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed bg-base-200/30 p-1 mx-4 mt-3">
                <button
                    className={`tab tab-sm ${activeTab === "code" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("code")}
                >
                    <CodeIcon className="size-4 mr-1" />
                    Code
                </button>
                <button
                    className={`tab tab-sm ${activeTab === "testcases" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("testcases")}
                >
                    Test Cases
                    {block.testCases?.length > 0 && (
                        <span className="ml-1 badge badge-sm">{block.testCases.length}</span>
                    )}
                </button>
                <button
                    className={`tab tab-sm ${activeTab === "output" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("output")}
                >
                    <TerminalIcon className="size-4 mr-1" />
                    Output
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {/* Code Editor */}
                {activeTab === "code" && (
                    <div className="rounded-lg overflow-hidden border border-base-300">
                        <Editor
                            height="300px"
                            language={LANGUAGE_CONFIG[block.language || "javascript"]?.monacoLang || "javascript"}
                            value={block.code || "// Write your solution here\n"}
                            onChange={handleCodeChange}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                minimap: { enabled: false },
                                padding: { top: 16 },
                            }}
                        />
                    </div>
                )}

                {/* Test Cases */}
                {activeTab === "testcases" && (
                    <div className="space-y-4">
                        {(block.testCases || []).map((tc, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${tc.passed === true
                                        ? "border-success/50 bg-success/5"
                                        : tc.passed === false
                                            ? "border-error/50 bg-error/5"
                                            : "border-base-300 bg-base-200/30"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium text-sm flex items-center gap-2">
                                        Test Case {index + 1}
                                        {tc.passed === true && <CheckCircleIcon className="size-4 text-success" />}
                                        {tc.passed === false && <XCircleIcon className="size-4 text-error" />}
                                    </span>
                                    <button
                                        onClick={() => removeTestCase(index)}
                                        className="btn btn-ghost btn-xs text-error"
                                    >
                                        <TrashIcon className="size-3" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-base-content/60 mb-1 block">
                                            Input (stdin)
                                        </label>
                                        <textarea
                                            value={tc.input || ""}
                                            onChange={(e) => updateTestCase(index, "input", e.target.value)}
                                            className="textarea textarea-bordered textarea-sm w-full font-mono"
                                            rows={2}
                                            placeholder="Optional input..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-base-content/60 mb-1 block">
                                            Expected Output
                                        </label>
                                        <textarea
                                            value={tc.expectedOutput || ""}
                                            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                                            className="textarea textarea-bordered textarea-sm w-full font-mono"
                                            rows={2}
                                            placeholder="Expected output..."
                                        />
                                    </div>
                                </div>

                                {tc.actualOutput && (
                                    <div className="mt-3">
                                        <label className="text-xs text-base-content/60 mb-1 block">
                                            Actual Output
                                        </label>
                                        <pre className="text-sm bg-base-300 p-2 rounded font-mono overflow-x-auto">
                                            {tc.actualOutput}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addTestCase}
                            className="btn btn-ghost btn-sm gap-2 w-full border border-dashed border-base-300"
                        >
                            <PlusIcon className="size-4" />
                            Add Test Case
                        </button>
                    </div>
                )}

                {/* Output */}
                {activeTab === "output" && (
                    <div className="rounded-lg border border-base-300 bg-base-300/50">
                        {output ? (
                            <div className="p-4">
                                {output.success ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-success">
                                            <CheckCircleIcon className="size-4" />
                                            <span className="text-sm font-medium">Execution Successful</span>
                                        </div>
                                        <pre className="text-sm font-mono whitespace-pre-wrap text-base-content">
                                            {output.output || "No output"}
                                        </pre>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-error">
                                            <XCircleIcon className="size-4" />
                                            <span className="text-sm font-medium">Execution Failed</span>
                                        </div>
                                        <pre className="text-sm font-mono whitespace-pre-wrap text-error">
                                            {output.error || "Unknown error"}
                                        </pre>
                                        {output.output && (
                                            <pre className="text-sm font-mono whitespace-pre-wrap text-base-content mt-2">
                                                {output.output}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-base-content/50">
                                <TerminalIcon className="size-8 mx-auto mb-2 opacity-50" />
                                <p>Click "Run Code" to see output</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CodeExecutionBlock;
