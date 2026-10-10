import React from 'react'

export default function DashboardLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {/* Header skeleton */}
            <div style={{ marginBottom: '28px' }}>
                <div
                    className="sq-skeleton"
                    style={{ height: '32px', width: '220px', borderRadius: '8px', marginBottom: '10px' }}
                />
                <div
                    className="sq-skeleton"
                    style={{ height: '16px', width: '340px', borderRadius: '4px' }}
                />
            </div>

            {/* Top row cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: '110px',
                            borderRadius: '14px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            className="sq-skeleton"
                            style={{ height: '14px', width: '40%', borderRadius: '4px' }}
                        />
                        <div
                            className="sq-skeleton"
                            style={{ height: '28px', width: '65%', borderRadius: '6px' }}
                        />
                        <div
                            className="sq-skeleton"
                            style={{ height: '12px', width: '80%', borderRadius: '4px' }}
                        />
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px',
                }}
            >
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: '280px',
                            borderRadius: '16px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        <div
                            className="sq-skeleton"
                            style={{ height: '22px', width: '50%', borderRadius: '6px' }}
                        />
                        <div
                            className="sq-skeleton"
                            style={{ height: '120px', width: '100%', borderRadius: '12px' }}
                        />
                        <div
                            className="sq-skeleton"
                            style={{ height: '14px', width: '90%', borderRadius: '4px' }}
                        />
                        <div
                            className="sq-skeleton"
                            style={{ height: '14px', width: '70%', borderRadius: '4px' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
