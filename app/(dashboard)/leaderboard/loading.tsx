export default function LeaderboardLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <div className="sq-skeleton" style={{ height: '32px', width: '230px', marginBottom: '8px' }} />
                <div className="sq-skeleton" style={{ height: '14px', width: '260px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="sq-skeleton" style={{ height: '34px', width: '98px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '102px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '106px' }} />
            </div>

            <div className="card">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderBottom: i < 7 ? '1px solid var(--border)' : 'none',
                        }}
                    >
                        <div className="sq-skeleton" style={{ width: '32px', height: '18px' }} />
                        <div className="sq-skeleton" style={{ width: '36px', height: '36px' }} />
                        <div style={{ flex: 1 }}>
                            <div className="sq-skeleton" style={{ height: '14px', width: '140px', marginBottom: '6px' }} />
                            <div className="sq-skeleton" style={{ height: '11px', width: '190px' }} />
                        </div>
                        <div style={{ width: '74px' }}>
                            <div className="sq-skeleton" style={{ height: '14px', marginBottom: '6px' }} />
                            <div className="sq-skeleton" style={{ height: '11px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
