export default function ProfileLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '72px', marginBottom: '14px' }} />
                    <div className="sq-skeleton" style={{ height: '8px', marginBottom: '10px' }} />
                    <div className="sq-skeleton" style={{ height: '8px', width: '70%', marginBottom: '14px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                    </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '20px', width: '170px', marginBottom: '16px' }} />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '44px', marginBottom: i < 3 ? '8px' : 0 }} />
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div className="sq-skeleton" style={{ height: '20px', width: '210px', marginBottom: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '84px' }} />
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
                <div className="sq-skeleton" style={{ height: '20px', width: '190px', marginBottom: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '40px' }} />
                    ))}
                </div>
            </div>
        </div>
    )
}
