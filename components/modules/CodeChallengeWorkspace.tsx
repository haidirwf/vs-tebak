'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Eye,
    Code2,
    FileCode,
    ThumbsUp,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from 'lucide-react'
import { CodeChallenge, CodeTestCase } from '@/types'

interface CodeChallengeWorkspaceProps {
    challenge: CodeChallenge
    onPass?: (passed: boolean) => void
    initialPassed?: boolean
}

interface TestResult {
    id: string
    description: string
    passed: boolean
    hint?: string
}

export default function CodeChallengeWorkspace({
    challenge,
    onPass,
    initialPassed = false,
}: CodeChallengeWorkspaceProps) {
    const isWeb = challenge.language === 'html' || challenge.language === 'css'

    // Editor state
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>(
        challenge.language === 'css' ? 'css' : challenge.language === 'javascript' ? 'js' : 'html'
    )
    const [htmlCode, setHtmlCode] = useState(challenge.starterHtml || '')
    const [cssCode, setCssCode] = useState(challenge.starterCss || '')
    const [jsCode, setJsCode] = useState(challenge.starterJs || '')

    // Feedback & validation state
    const [testResults, setTestResults] = useState<TestResult[]>([])
    const [hasTested, setHasTested] = useState(initialPassed)
    const [allPassed, setAllPassed] = useState(initialPassed)
    const [showHints, setShowHints] = useState(false)
    const [showSolution, setShowSolution] = useState(false)
    const [previewKey, setPreviewKey] = useState(0)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Current code based on active tab
    const currentCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode
    const setCurrentCode = (val: string) => {
        if (activeTab === 'html') setHtmlCode(val)
        else if (activeTab === 'css') setCssCode(val)
        else setJsCode(val)
    }

    // Reset code to starter
    const handleReset = () => {
        if (window.confirm('Kembalikan kode ke kondisi awal?')) {
            setHtmlCode(challenge.starterHtml || '')
            setCssCode(challenge.starterCss || '')
            setJsCode(challenge.starterJs || '')
            setTestResults([])
            setHasTested(false)
            setAllPassed(false)
            setPreviewKey((k) => k + 1)
        }
    }

    // Indentation support in textarea
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault()
            const target = e.currentTarget
            const start = target.selectionStart
            const end = target.selectionEnd
            const value = target.value

            const newValue = value.substring(0, start) + '  ' + value.substring(end)
            setCurrentCode(newValue)

            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 2
            }, 0)
        }
    }

    // Line numbers calculation
    const lineCount = useMemo(() => {
        const count = currentCode.split('\n').length
        return Math.max(count, 12)
    }, [currentCode])

    // Generate iframe document source
    const previewSrcDoc = useMemo(() => {
        if (!isWeb) return ''
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
    }
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
</body>
</html>`
    }, [isWeb, htmlCode, cssCode])

    // Validate tests against code
    const runValidation = () => {
        const results: TestResult[] = []

        if (isWeb) {
            // Parse DOM for validation
            const parser = new DOMParser()
            const doc = parser.parseFromString(
                `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}</body></html>`,
                'text/html'
            )

            // Normalized CSS string for rule inspection
            const cleanCss = cssCode.toLowerCase().replace(/\s+/g, ' ')

            for (const test of challenge.testCases) {
                let passed = false

                if (test.type === 'selector' && test.selector) {
                    const el = doc.querySelector(test.selector)
                    passed = Boolean(el)
                } else if (test.type === 'text' && test.selector && test.expectedText) {
                    const el = doc.querySelector(test.selector)
                    const text = el?.textContent?.toLowerCase() || ''
                    passed = text.includes(test.expectedText.toLowerCase())
                } else if (test.type === 'css' && test.selector && test.cssProperty) {
                    // Check if selector exists in HTML
                    const el = doc.querySelector(test.selector)
                    // Check if CSS contains selector and property
                    const selectorPart = test.selector.toLowerCase().replace(/[.#]/g, '')
                    const propPart = test.cssProperty.toLowerCase()
                    const hasRule = cleanCss.includes(propPart)
                    passed = Boolean(el) && hasRule
                } else if (test.type === 'regex' && test.regex) {
                    const combined = `${htmlCode}\n${cssCode}`
                    const re = new RegExp(test.regex, 'i')
                    passed = re.test(combined)
                }

                results.push({
                    id: test.id,
                    description: test.description,
                    passed,
                    hint: test.hint,
                })
            }
        } else {
            // Logic validation (JS)
            for (const test of challenge.testCases) {
                let passed = false
                if (test.regex) {
                    const re = new RegExp(test.regex, 'i')
                    passed = re.test(jsCode)
                }
                results.push({
                    id: test.id,
                    description: test.description,
                    passed,
                    hint: test.hint,
                })
            }
        }

        setTestResults(results)
        setHasTested(true)
        const allOk = results.length > 0 && results.every((r) => r.passed)
        setAllPassed(allOk)
        if (onPass) {
            onPass(allOk)
        }
        setPreviewKey((k) => k + 1)
    }

    return (
        <div
            style={{
                borderRadius: '12px',
                border: '1px solid var(--surface-border)',
                backgroundColor: 'var(--surface-card)',
                overflow: 'hidden',
                margin: '20px 0',
            }}
        >
            {/* Header: Judul & Instruksi Tantangan */}
            <div
                style={{
                    padding: '18px 20px',
                    borderBottom: '1px solid var(--surface-border)',
                    backgroundColor: 'var(--surface-elevated)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '7px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-gold-text)',
                            }}
                        >
                            <Code2 size={16} />
                        </div>
                        <h3
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '16px',
                                fontWeight: 700,
                                margin: 0,
                                color: 'var(--text-primary)',
                            }}
                        >
                            Tantangan Praktik Koding
                        </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {challenge.hints && challenge.hints.length > 0 && (
                            <button
                                onClick={() => setShowHints(!showHints)}
                                type="button"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--surface-border)',
                                    backgroundColor: 'var(--surface-card)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                <HelpCircle size={13} />
                                {showHints ? 'Tutup Petunjuk' : 'Lihat Petunjuk'}
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            type="button"
                            title="Kembalikan kode ke template awal"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--surface-border)',
                                backgroundColor: 'var(--surface-card)',
                                color: 'var(--text-secondary)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}
                        >
                            <RotateCcw size={13} />
                            Reset Kode
                        </button>
                    </div>
                </div>

                {/* Instructions Text */}
                <div
                    style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--text-secondary)',
                    }}
                >
                    {challenge.instructions}
                </div>

                {/* Collapsible Hints */}
                {showHints && challenge.hints && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            marginTop: '12px',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--surface-canvas)',
                            border: '1px solid var(--surface-border)',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--accent-gold-text)' }}>
                            Petunjuk Pengerjaan:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                            {challenge.hints.map((hint, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>
                                    {hint}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </div>

            {/* Main Area: Split Editor & Preview */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isWeb ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
                    minHeight: '380px',
                    backgroundColor: 'var(--surface-canvas)',
                }}
            >
                {/* Editor Column */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: isWeb ? '1px solid var(--surface-border)' : 'none',
                    }}
                >
                    {/* Editor Tabs Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 8px',
                            backgroundColor: 'var(--surface-elevated)',
                            borderBottom: '1px solid var(--surface-border)',
                            height: '38px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isWeb ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('html')}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: activeTab === 'html' ? 700 : 500,
                                            border: 'none',
                                            borderRadius: '6px 6px 0 0',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'html' ? 'var(--surface-canvas)' : 'transparent',
                                            color: activeTab === 'html' ? 'var(--accent-gold-text)' : 'var(--text-muted)',
                                            borderBottom: activeTab === 'html' ? '2px solid var(--brand-primary)' : 'none',
                                        }}
                                    >
                                        index.html
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('css')}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: activeTab === 'css' ? 700 : 500,
                                            border: 'none',
                                            borderRadius: '6px 6px 0 0',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'css' ? 'var(--surface-canvas)' : 'transparent',
                                            color: activeTab === 'css' ? 'var(--accent-gold-text)' : 'var(--text-muted)',
                                            borderBottom: activeTab === 'css' ? '2px solid var(--brand-primary)' : 'none',
                                        }}
                                    >
                                        style.css
                                    </button>
                                </>
                            ) : (
                                <span
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'var(--accent-gold-text)',
                                    }}
                                >
                                    script.js
                                </span>
                            )}
                        </div>

                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            Tekan Tab untuk indentasi
                        </span>
                    </div>

                    {/* Editor Textarea with Line Numbers */}
                    <div
                        style={{
                            display: 'flex',
                            flex: 1,
                            backgroundColor: '#0d1117',
                            position: 'relative',
                            minHeight: '260px',
                        }}
                    >
                        {/* Line Numbers Gutter */}
                        <div
                            style={{
                                width: '38px',
                                padding: '14px 6px',
                                userSelect: 'none',
                                textAlign: 'right',
                                color: '#4b5563',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                lineHeight: '1.6',
                                borderRight: '1px solid #1f2937',
                                backgroundColor: '#090d13',
                            }}
                        >
                            {Array.from({ length: lineCount }).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>

                        {/* Code Input Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={currentCode}
                            onChange={(e) => setCurrentCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoCapitalize="off"
                            autoComplete="off"
                            style={{
                                flex: 1,
                                padding: '14px 14px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#e6edf3',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                resize: 'none',
                                whiteSpace: 'pre',
                                overflowX: 'auto',
                            }}
                        />
                    </div>
                </div>

                {/* Preview / Output Column */}
                {isWeb && (
                    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-canvas)' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 12px',
                                backgroundColor: 'var(--surface-elevated)',
                                borderBottom: '1px solid var(--surface-border)',
                                height: '38px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                <Eye size={13} />
                                <span>Pratinjau Hasil</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Live Sandbox
                            </span>
                        </div>

                        <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
                            <iframe
                                key={previewKey}
                                srcDoc={previewSrcDoc}
                                title="Code Preview Sandbox"
                                sandbox="allow-scripts"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: '260px',
                                    border: 'none',
                                    backgroundColor: '#0f172a',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Test Results & Validation Checklist Area */}
            <div
                style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--surface-border)',
                    backgroundColor: 'var(--surface-elevated)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '14px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Kriteria Keberhasilan:
                        </span>
                        {hasTested && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)',
                                }}
                            >
                                {testResults.filter((r) => r.passed).length} dari {testResults.length} Kriteria Terpenuhi
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={runValidation}
                        className="btn-signal-orange"
                        style={{
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            cursor: 'pointer',
                        }}
                    >
                        <Play size={14} />
                        <span>Jalankan & Uji Kode</span>
                    </button>
                </div>

                {/* Validation Checklist Items */}
                <div style={{ display: 'grid', gap: '8px' }}>
                    {challenge.testCases.map((tc) => {
                        const result = testResults.find((r) => r.id === tc.id)
                        const isEvaluated = hasTested && result !== undefined
                        const isOk = result?.passed

                        return (
                            <div
                                key={tc.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: isEvaluated
                                        ? isOk
                                            ? 'rgba(34, 197, 94, 0.08)'
                                            : 'rgba(239, 68, 68, 0.08)'
                                        : 'var(--surface-card)',
                                    border: `1px solid ${
                                        isEvaluated
                                            ? isOk
                                                ? 'rgba(34, 197, 94, 0.25)'
                                                : 'rgba(239, 68, 68, 0.25)'
                                            : 'var(--surface-border)'
                                    }`,
                                    fontSize: '13px',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                    {isEvaluated ? (
                                        isOk ? (
                                            <CheckCircle2 size={16} style={{ color: 'var(--accent-green, #16a34a)' }} />
                                        ) : (
                                            <XCircle size={16} style={{ color: 'var(--accent-red, #ef4444)' }} />
                                        )
                                    ) : (
                                        <div
                                            style={{
                                                width: '14px',
                                                height: '14px',
                                                borderRadius: '3px',
                                                border: '1.5px solid var(--surface-border)',
                                            }}
                                        />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            color: isEvaluated && isOk ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            fontWeight: isEvaluated && isOk ? 600 : 400,
                                        }}
                                    >
                                        {tc.description}
                                    </div>
                                    {isEvaluated && !isOk && tc.hint && (
                                        <div style={{ fontSize: '12px', color: 'var(--accent-red, #ef4444)', marginTop: '3px' }}>
                                            Saran: {tc.hint}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Success Banner if All Pass */}
                {hasTested && allPassed && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: '14px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ThumbsUp size={16} style={{ color: 'var(--accent-green, #16a34a)' }} />
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--accent-green, #16a34a)' }}>
                                    Tantangan Selesai!
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                                    Kode Anda valid dan memenuhi semua kriteria. Anda siap lanjut ke tahap berikutnya.
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
