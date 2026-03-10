export default function BattleLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div className="sq-skeleton" style={{ height: '34px', width: '260px', margin: '0 auto 8px' }} />
                <div className="sq-skeleton" style={{ height: '14px', width: '300px', maxWidth: '100%', margin: '0 auto' }} />
            </div>

            <div className="battle-select-layout" style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="sq-skeleton battle-select-card" style={{ minHeight: '148px' }} />
                    <div className="sq-skeleton battle-select-card" style={{ minHeight: '148px' }} />
                    <div className="sq-skeleton battle-select-card" style={{ minHeight: '148px' }} />
                </div>

                <div className="card battle-room-panel" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div className="sq-skeleton" style={{ height: '22px', width: '190px' }} />
                        <div className="sq-skeleton" style={{ height: '14px', width: '88px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="sq-skeleton" style={{ height: '78px' }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
