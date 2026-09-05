import React from 'react';

export function Card({ children, accent = false, className = '', padding, as: Tag = 'div', ...props }) {
    const classes = [
        'ui-card',
        accent ? 'ui-card--accent' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Tag className={classes} style={padding ? { padding } : undefined} {...props}>
            {children}
        </Tag>
    );
}
