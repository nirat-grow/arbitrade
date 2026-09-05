import React from 'react';

export function Button({
    children,
    variant = 'primary',
    type = 'button',
    loading = false,
    disabled = false,
    className = '',
    fullWidth = false,
    ...props
}) {
    const classes = [
        'ui-btn',
        `ui-btn--${variant}`,
        fullWidth ? 'ui-btn--full' : '',
        loading ? 'ui-btn--loading' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button type={type} className={classes} disabled={disabled || loading} {...props}>
            {loading && <span className="ui-btn-spinner" aria-hidden="true" />}
            <span className={loading ? 'ui-btn-label is-loading' : 'ui-btn-label'}>{children}</span>
        </button>
    );
}
