import React from 'react'

export default function ModuleDetailLoading() {
    return (
        <div
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '24px',
                paddingBottom: '32px',
                minHeight: 'calc(100vh - 56px)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                width: '100%',
            }}
        >
            {/* Back Button Skeleton */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                }}
            >
                <div
                    className="sq-skeleton"
                    style={{
                        width: '140px',
                        height: '24px',
                        borderRadius: '6px',
                    }}
                />
            </div>

            {/* Topbar: Category, XP, and Progress Skeleton */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    gap: '12px',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        className="sq-skeleton"
                        style={{
                            width: '80px',
                            height: '24px',
                            borderRadius: '6px',
                        }}
                    />
                    <div
                        className="sq-skeleton"
                        style={{
                            width: '60px',
                            height: '24px',
                            borderRadius: '6px',
                        }}
                    />
                </div>
                <div
                    className="sq-skeleton"
                    style={{
                        width: '100px',
                        height: '20px',
                        borderRadius: '6px',
                    }}
                />
            </div>

            {/* Progress Bar Skeleton */}
            <div
                className="sq-skeleton"
                style={{
                    height: '6px',
                    width: '100%',
                    borderRadius: '4px',
                    marginBottom: '24px',
                }}
            />

            {/* Main Content Card Skeleton */}
            <div
                className="card"
                style={{
                    padding: '28px 24px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Title Skeleton */}
                <div
                    className="sq-skeleton"
                    style={{
                        height: '32px',
                        width: '65%',
                        borderRadius: '8px',
                        marginBottom: '14px',
                    }}
                />

                {/* Subtitle / Description Skeleton */}
                <div
                    className="sq-skeleton"
                    style={{
                        height: '16px',
                        width: '90%',
                        borderRadius: '4px',
                        marginBottom: '8px',
                    }}
                />
                <div
                    className="sq-skeleton"
                    style={{
                        height: '16px',
                        width: '75%',
                        borderRadius: '4px',
                        marginBottom: '28px',
                    }}
                />

                {/* Content Box Skeleton */}
                <div
                    style={{
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                        marginBottom: '28px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    <div className="sq-skeleton" style={{ height: '14px', width: '100%', borderRadius: '4px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '95%', borderRadius: '4px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '88%', borderRadius: '4px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '92%', borderRadius: '4px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px' }} />
                </div>

                {/* Action CTA Skeleton */}
                <div
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        paddingTop: '20px',
                        borderTop: '1px solid var(--surface-border)',
                    }}
                >
                    <div
                        className="sq-skeleton"
                        style={{
                            height: '42px',
                            width: '160px',
                            borderRadius: '8px',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
