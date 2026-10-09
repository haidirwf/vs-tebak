import React from 'react'

export default function ModulesLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <div className="sq-skeleton" style={{ height: '32px', width: '220px', borderRadius: '8px', marginBottom: '8px' }} />
                <div className="sq-skeleton" style={{ height: '16px', width: '320px', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="sq-skeleton" style={{ height: '42px', flex: 1, minWidth: '200px', borderRadius: '10px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '36px', width: '80px', borderRadius: '8px' }} />
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="card"
                        style={{
                            padding: '24px',
                            height: '240px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div className="sq-skeleton" style={{ height: '24px', width: '90px', borderRadius: '6px' }} />
                            <div className="sq-skeleton" style={{ height: '20px', width: '50px', borderRadius: '6px' }} />
                        </div>
                        <div className="sq-skeleton" style={{ height: '22px', width: '75%', borderRadius: '6px', marginBottom: '10px' }} />
                        <div className="sq-skeleton" style={{ height: '14px', width: '90%', borderRadius: '4px', marginBottom: '8px' }} />
                        <div className="sq-skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px', marginBottom: 'auto' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                            <div className="sq-skeleton" style={{ height: '16px', width: '50px', borderRadius: '4px' }} />
                            <div className="sq-skeleton" style={{ height: '16px', width: '60px', borderRadius: '4px' }} />
                            <div className="sq-skeleton" style={{ height: '16px', width: '70px', borderRadius: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
