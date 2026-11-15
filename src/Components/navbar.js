import React from 'react'
import PropTypes from 'prop-types'

export default function Navbar(props) {
  const isDark = props.mode === 'dark'

  return (
    <header className="nav">
      <div className="nav__inner">
        <span className="nav__brand">
          <span className="nav__mark" aria-hidden="true">T</span>
          {props.title}
        </span>
        <button
          type="button"
          className="theme-toggle"
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
          onClick={props.toggleMode}
        >
          <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
          <span className="theme-toggle__track" aria-hidden="true">
            <span className="theme-toggle__thumb" />
          </span>
        </button>
      </div>
    </header>
  )
}

Navbar.propTypes = {
  title: PropTypes.string,
  mode: PropTypes.string,
  toggleMode: PropTypes.func,
}
