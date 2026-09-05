import React, { useState } from 'react';

const EyeIcon = ({ off }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {off ? (
            <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
                <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9.3 3.1 11 7.5a12.3 12.3 0 0 1-4.2 5.1" />
                <path d="M6.7 6.7A12.3 12.3 0 0 0 1 12.5C2.7 16.9 7 20 12 20c1.3 0 2.6-.2 3.8-.7" />
            </>
        ) : (
            <>
                <path d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5C21.3 16.9 17 20 12 20S2.7 16.9 1 12.5z" />
                <circle cx="12" cy="12.5" r="3" />
            </>
        )}
    </svg>
);

export function Input({
    label,
    error,
    hint,
    type = 'text',
    numeric = false,
    className = '',
    id,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
        <div className={`ui-field ${className}`.trim()}>
            {label && (
                <label className="ui-label" htmlFor={inputId}>{label}</label>
            )}
            <div className="ui-input-wrap">
                <input
                    id={inputId}
                    type={inputType}
                    className={[
                        'ui-input',
                        error ? 'ui-input--error' : '',
                        numeric ? 'ui-input--numeric' : '',
                        isPassword ? 'ui-input--password' : '',
                    ].filter(Boolean).join(' ')}
                    aria-invalid={error ? 'true' : undefined}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="ui-input-toggle"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <EyeIcon off={showPassword} />
                    </button>
                )}
            </div>
            {error && <p className="ui-field-error">{error}</p>}
            {!error && hint && <p className="ui-field-hint">{hint}</p>}
        </div>
    );
}
