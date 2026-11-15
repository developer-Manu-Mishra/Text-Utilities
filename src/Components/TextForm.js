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

    const dark = props.mode === 'dark'
    const textColor = dark ? 'white' : 'black'
    const boxStyle = {
        backgroundColor: dark ? '#222222' : 'white',
        color: textColor,
    }
    const buttonClass = `btn btn-outline-${dark ? 'light' : 'primary'} mx-1 my-1`

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
        const matches = text.split(findText).length - 1
        applyText(text.split(findText).join(replaceText), `Replaced ${matches} Occurrence${matches === 1 ? '' : 's'}`)
    }

    const actions = [
        { label: 'Convert To UpperCase', run: () => applyText(text.toUpperCase(), 'Converted To Uppercase') },
        { label: 'Convert To LowerCase', run: () => applyText(text.toLowerCase(), 'Converted To Lowercase') },
        { label: 'Sentence Case', run: () => applyText(toSentenceCase(text), 'Converted To Sentence Case') },
        {
            label: 'Title Case',
            run: () =>
                applyText(
                    text.replace(/\b\w/g, (letter) => letter.toUpperCase()),
                    'Converted To Title Case'
                ),
        },
        {
            label: 'Reverse Text',
            run: () => applyText([...text].reverse().join(''), 'Text Has Been Reversed'),
        },
        {
            label: 'Remove Extra Spaces',
            run: () => applyText(text.replace(/[ \t]+/g, ' ').trim(), 'Extra Spaces Removed'),
        },
        {
            label: 'Remove Punctuation',
            run: () => applyText(text.replace(/[^\w\s]/g, ''), 'Punctuation Removed'),
        },
        {
            label: 'Remove Numbers',
            run: () => applyText(text.replace(/[0-9]/g, ''), 'Numbers Removed'),
        },
        {
            label: 'Remove Line Breaks',
            run: () => applyText(text.replace(/\s*\n\s*/g, ' ').trim(), 'Line Breaks Removed'),
        },
        { label: 'Undo', run: handleUndoClick, disabled: !history.length },
    ]

    const stats = getStats(text)
    const matches = findText ? text.split(findText).length - 1 : 0

    return (
        <>
            <div className="container my-3" style={{ color: textColor }}>
                <h3>{props.heading}</h3>
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        rows="8"
                        value={text}
                        onChange={handleOnChange}
                        style={boxStyle}
                        id="text"
                        ref={textAreaRef}
                        placeholder="Type or paste your text here..."
                    ></textarea>
                </div>

                <div className="mb-3">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            className={buttonClass}
                            onClick={action.run}
                            disabled={action.disabled}
                        >
                            {action.label}
                        </button>
                    ))}
                    <button className={buttonClass} onClick={handleClearClick}>
                        Clear Text
                    </button>
                    <button className={buttonClass} onClick={handleCopyClick}>
                        Copy Text
                    </button>
                    <button className={buttonClass} onClick={handleDownloadClick}>
                        Download .txt
                    </button>
                    <button className={buttonClass} onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                        Open .txt
                    </button>
                    <input
                        type="file"
                        accept=".txt,text/plain"
                        className="d-none"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>

                <div className="card my-3" style={{ ...boxStyle, border: `1px solid ${dark ? '#444' : '#dee2e6'}` }}>
                    <div className="card-body">
                        <h5 className="card-title">Find &amp; Replace</h5>
                        <div className="row g-2 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label" htmlFor="find-text">
                                    Find
                                </label>
                                <input
                                    id="find-text"
                                    className="form-control"
                                    value={findText}
                                    onChange={(event) => setFindText(event.target.value)}
                                    style={boxStyle}
                                    placeholder="Word or phrase"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label" htmlFor="replace-text">
                                    Replace with
                                </label>
                                <input
                                    id="replace-text"
                                    className="form-control"
                                    value={replaceText}
                                    onChange={(event) => setReplaceText(event.target.value)}
                                    style={boxStyle}
                                    placeholder="Leave empty to delete"
                                />
                            </div>
                            <div className="col-md-4">
                                <button className={buttonClass} onClick={handleReplaceClick}>
                                    Replace All
                                </button>
                                <span className="mx-2">{matches} match{matches === 1 ? '' : 'es'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container my-3" style={{ color: textColor }}>
                <h4>Your Text Summary</h4>
                <div className="row g-3 my-1">
                    {[
                        { label: 'Words', value: stats.words },
                        { label: 'Characters', value: stats.characters },
                        { label: 'Characters (no spaces)', value: stats.charactersNoSpaces },
                        { label: 'Sentences', value: stats.sentences },
                        { label: 'Paragraphs', value: stats.paragraphs },
                        { label: 'Reading Time', value: `${stats.readingTime} min` },
                        { label: 'Speaking Time', value: `${stats.speakingTime} min` },
                    ].map((item) => (
                        <div className="col-6 col-md-3" key={item.label}>
                            <div
                                className="card h-100"
                                style={{ ...boxStyle, border: `1px solid ${dark ? '#444' : '#dee2e6'}` }}
                            >
                                <div className="card-body py-2">
                                    <div className="fs-4">{item.value}</div>
                                    <small>{item.label}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="text-center mt-3">Preview</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{text.trim() ? text : 'Enter Your Text To Preview Here'}</p>
            </div>
        </>
    )
}
