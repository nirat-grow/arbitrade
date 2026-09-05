import React from 'react';

export function PageHeader({ title, subtitle, breadcrumbs, action }) {
    return (
        <div className="ui-page-header">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="ui-breadcrumbs" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={crumb}>
                            {i > 0 && <span className="ui-breadcrumbs-sep" aria-hidden="true">/</span>}
                            {i === breadcrumbs.length - 1 ? (
                                <span className="ui-breadcrumbs-current">{crumb}</span>
                            ) : (
                                <span>{crumb}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}
            <div className="ui-page-header-row">
                <div>
                    <h1 className="ui-page-title">{title}</h1>
                    {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
                </div>
                {action && <div className="ui-page-header-action">{action}</div>}
            </div>
        </div>
    );
}
