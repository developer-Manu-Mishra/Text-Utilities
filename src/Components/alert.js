import React from 'react'

function Alert(props) {
    if (!props.alert) return null

    const capitalize = (word) => {
        const lower = word.toLowerCase()
        return lower.charAt(0).toUpperCase() + lower.slice(1)
    }

    return (
        <div className="toast-wrap" role="status" aria-live="polite">
            <div className={`toast toast--${props.alert.type}`}>
                <span className="toast__dot" aria-hidden="true" />
                <span>
                    <strong className="toast__type">{capitalize(props.alert.type)}</strong>: {props.alert.msg}
                </span>
            </div>
        </div>
    )
}

export default Alert
