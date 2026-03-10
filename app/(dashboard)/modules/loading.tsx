export default function ModulesLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <div className="sq-skeleton" style={{ height: '32px', width: '220px', marginBottom: '8px' }} />
                <div className="sq-skeleton" style={{ height: '14px', width: '320px', maxWidth: '100%' }} />
            </div>

            <div className="sq-skeleton" style={{ height: '40px', maxWidth: '400px', marginBottom: '16px' }} />

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="sq-skeleton" style={{ height: '34px', width: '78px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '84px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '82px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '106px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '74px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div className="sq-skeleton" style={{ height: '18px', width: '82px' }} />
                            <div className="sq-skeleton" style={{ height: '18px', width: '18px' }} />
                        </div>
                        <div className="sq-skeleton" style={{ height: '20px', marginBottom: '8px' }} />
                        <div className="sq-skeleton" style={{ height: '12px', marginBottom: '6px' }} />
                        <div className="sq-skeleton" style={{ height: '12px', width: '78%', marginBottom: '12px' }} />
                        <div className="sq-skeleton" style={{ height: '3px', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className="sq-skeleton" style={{ height: '12px', width: '56px' }} />
                            <div className="sq-skeleton" style={{ height: '12px', width: '68px' }} />
                            <div className="sq-skeleton" style={{ height: '12px', width: '60px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
