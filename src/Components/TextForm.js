import React, { useRef, useState } from 'react'

const READING_WORDS_PER_MINUTE = 200
const SPEAKING_WORDS_PER_MINUTE = 130

const formatMinutes = (words, speed) => {
    if (!words) return '0'
    const minutes = words / speed
    return minutes < 1 ? minutes.toFixed(2) : minutes.toFixed(1)
}

const toSentenceCase = (value) =>
    value
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase())

const getStats = (text) => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    return {
        words,
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        sentences: trimmed ? text.split(/[.!?]+/).filter((part) => part.trim()).length : 0,
        paragraphs: trimmed ? text.split(/\n+/).filter((part) => part.trim()).length : 0,
        readingTime: formatMinutes(words, READING_WORDS_PER_MINUTE),
        speakingTime: formatMinutes(words, SPEAKING_WORDS_PER_MINUTE),
    }
}

export default function TextForm(props) {
    const [text, setText] = useState('')
    const [history, setHistory] = useState([])
    const [findText, setFindText] = useState('')
    const [replaceText, setReplaceText] = useState('')
    const textAreaRef = useRef(null)
    const fileInputRef = useRef(null)

    // Replaces the text while remembering the previous version so it can be undone.
    const applyText = (nextText, message) => {
        if (nextText === text) {
            props.showAlert('Nothing To Change', 'warning')
            return
        }
        setHistory((previous) => [...previous.slice(-19), text])
        setText(nextText)
        if (message) props.showAlert(message, 'success')
    }

    const handleOnChange = (event) => {
        setText(event.target.value)
    }

    const handleUndoClick = () => {
        if (!history.length) {
            props.showAlert('Nothing To Undo', 'warning')
            return
        }
        const previous = history[history.length - 1]
        setHistory((rest) => rest.slice(0, -1))
        setText(previous)
        props.showAlert('Last Change Undone', 'success')
    }

    const handleClearClick = () => {
        applyText('', 'Text Has Been Cleared')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleCopyClick = async () => {
        if (!text) {
            props.showAlert('Nothing To Copy', 'warning')
            return
        }
        try {
            await navigator.clipboard.writeText(text)
            props.showAlert('Text Has Been Copied', 'success')
        } catch (error) {
            // Clipboard API can be blocked (insecure origin or old browser), fall back to the textarea.
            const textArea = textAreaRef.current
            if (textArea) {
                textArea.select()
                document.execCommand('copy')
            }
            props.showAlert('Text Has Been Copied', 'success')
        }
    }

    const handleDownloadClick = () => {
        if (!text.trim()) {
            props.showAlert('Nothing To Download', 'warning')
            return
        }
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'text-utilities.txt'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        props.showAlert('Text Downloaded', 'success')
    }

    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (loadEvent) => {
            applyText(String(loadEvent.target.result || ''), `Loaded ${file.name}`)
        }
        reader.onerror = () => props.showAlert('Could Not Read That File', 'danger')
        reader.readAsText(file)
        event.target.value = ''
    }

    const handleReplaceClick = () => {
        if (!findText) {
            props.showAlert('Enter Text To Find', 'warning')
            return
        }
        if (!text.includes(findText)) {
            props.showAlert('No Match Found', 'warning')
            return
        }
        const matchesFound = text.split(findText).length - 1
        applyText(
            text.split(findText).join(replaceText),
            `Replaced ${matchesFound} Occurrence${matchesFound === 1 ? '' : 's'}`
        )
    }

    const groups = [
        {
            title: 'Change case',
            actions: [
                { label: 'UPPERCASE', run: () => applyText(text.toUpperCase(), 'Converted To Uppercase') },
                { label: 'lowercase', run: () => applyText(text.toLowerCase(), 'Converted To Lowercase') },
                { label: 'Sentence case', run: () => applyText(toSentenceCase(text), 'Converted To Sentence Case') },
                {
                    label: 'Title Case',
                    run: () =>
                        applyText(
                            text.replace(/\b\w/g, (letter) => letter.toUpperCase()),
                            'Converted To Title Case'
                        ),
                },
            ],
        },
        {
            title: 'Clean up',
            actions: [
                {
                    label: 'Fix spacing',
                    run: () => applyText(text.replace(/[ \t]+/g, ' ').trim(), 'Extra Spaces Removed'),
                },
                { label: 'No punctuation', run: () => applyText(text.replace(/[^\w\s]/g, ''), 'Punctuation Removed') },
                { label: 'No numbers', run: () => applyText(text.replace(/[0-9]/g, ''), 'Numbers Removed') },
                {
                    label: 'Join lines',
                    run: () => applyText(text.replace(/\s*\n\s*/g, ' ').trim(), 'Line Breaks Removed'),
                },
            ],
        },
        {
            title: 'Other',
            actions: [
                { label: 'Reverse text', run: () => applyText([...text].reverse().join(''), 'Text Has Been Reversed') },
            ],
        },
    ]

    const stats = getStats(text)
    const matches = findText ? text.split(findText).length - 1 : 0

    return (
        <main className="shell">
            <section className="hero">
                <h1 className="hero__title">{props.heading}</h1>
                <p className="hero__sub">
                    Paste your text, pick a tool, and get clean, case-perfect copy in seconds. Everything runs
                    locally in your browser — nothing is uploaded.
                </p>
                <div className="hero__badges">
                    <span className="badge">{stats.words} words</span>
                    <span className="badge">{stats.characters} characters</span>
                    <span className="badge">{stats.readingTime} min read</span>
                </div>
            </section>

            <section className="panel">
                <div className="panel__head">
                    <h2 className="panel__title">Your text</h2>
                    <span className="panel__hint">Type, paste or open a .txt file</span>
                </div>
                <textarea
                    className="editor"
                    rows="8"
                    value={text}
                    onChange={handleOnChange}
                    id="text"
                    ref={textAreaRef}
                    placeholder="Type or paste your text here..."
                    aria-label="Text to analyze"
                ></textarea>
                <div className="editor-meta">
                    <div className="editor-meta__actions">
                        <button className="btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                            Open .txt
                        </button>
                        <button className="btn" onClick={handleDownloadClick}>
                            Download .txt
                        </button>
                        <button className="btn" onClick={handleCopyClick}>
                            Copy
                        </button>
                        <button className="btn btn--ghost" onClick={handleClearClick}>
                            Clear
                        </button>
                    </div>
                    <span>
                        {stats.sentences} sentence{stats.sentences === 1 ? '' : 's'} · {stats.paragraphs} paragraph
                        {stats.paragraphs === 1 ? '' : 's'}
                    </span>
                </div>
                <input
                    type="file"
                    accept=".txt,text/plain"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    hidden
                />
            </section>

            <section className="panel">
                <div className="panel__head">
                    <h2 className="panel__title">Transform</h2>
                    <button className="btn" onClick={handleUndoClick} disabled={!history.length}>
                        Undo
                    </button>
                </div>
                <div className="toolbar">
                    {groups.map((group) => (
                        <div className="tool-group" key={group.title}>
                            <h3 className="tool-group__title">{group.title}</h3>
                            <div className="tool-group__items">
                                {group.actions.map((action) => (
                                    <button key={action.label} className="btn" onClick={action.run}>
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel">
                <div className="panel__head">
                    <h2 className="panel__title">Find &amp; Replace</h2>
                    <span className="match-count">
                        {matches} match{matches === 1 ? '' : 'es'}
                    </span>
                </div>
                <div className="replace">
                    <div className="field">
                        <label htmlFor="find-text">Find</label>
                        <input
                            id="find-text"
                            className="input"
                            value={findText}
                            onChange={(event) => setFindText(event.target.value)}
                            placeholder="Word or phrase"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="replace-text">Replace with</label>
                        <input
                            id="replace-text"
                            className="input"
                            value={replaceText}
                            onChange={(event) => setReplaceText(event.target.value)}
                            placeholder="Leave empty to delete"
                        />
                    </div>
                    <div className="replace__action">
                        <button className="btn btn--primary" onClick={handleReplaceClick}>
                            Replace all
                        </button>
                    </div>
                </div>
            </section>

            <section className="panel">
                <div className="panel__head">
                    <h2 className="panel__title">Your Text Summary</h2>
                </div>
                <div className="stats">
                    {[
                        { label: 'Words', value: stats.words },
                        { label: 'Characters', value: stats.characters },
                        { label: 'Characters (no spaces)', value: stats.charactersNoSpaces },
                        { label: 'Sentences', value: stats.sentences },
                        { label: 'Paragraphs', value: stats.paragraphs },
                        { label: 'Reading time', value: `${stats.readingTime} min` },
                        { label: 'Speaking time', value: `${stats.speakingTime} min` },
                    ].map((item) => (
                        <div className="stat" key={item.label}>
                            <div className="stat__value">{item.value}</div>
                            <div className="stat__label">{item.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel">
                <div className="panel__head">
                    <h2 className="panel__title">Preview</h2>
                </div>
                <p className={`preview${text.trim() ? '' : ' preview--empty'}`}>
                    {text.trim() ? text : 'Your text will appear here…'}
                </p>
            </section>
        </main>
    )
}
