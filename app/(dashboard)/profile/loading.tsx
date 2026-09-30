export default function ProfileLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header Title Skeleton */}
            <div style={{ marginBottom: '24px' }}>
                <div className="sq-skeleton" style={{ height: '30px', width: '220px', marginBottom: '8px' }} />
                <div className="sq-skeleton" style={{ height: '14px', width: '380px' }} />
            </div>

            {/* Hero Stage Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#141414', border: '1px solid #282828', borderRadius: '16px', padding: '24px' }}>
                    <div className="sq-skeleton" style={{ height: '180px', borderRadius: '12px', marginBottom: '16px' }} />
                    <div className="sq-skeleton" style={{ height: '24px', width: '160px', margin: '0 auto 8px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '200px', margin: '0 auto 20px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="sq-skeleton" style={{ height: '42px', borderRadius: '8px' }} />
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ backgroundColor: '#141414', border: '1px solid #282828', borderRadius: '16px', padding: '20px' }}>
                        <div className="sq-skeleton" style={{ height: '24px', width: '180px', marginBottom: '12px' }} />
                        <div className="sq-skeleton" style={{ height: '8px', marginBottom: '8px' }} />
                    </div>

                    <div style={{ backgroundColor: '#141414', border: '1px solid #282828', borderRadius: '16px', padding: '20px' }}>
                        <div className="sq-skeleton" style={{ height: '20px', width: '160px', marginBottom: '14px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="sq-skeleton" style={{ height: '70px', borderRadius: '10px' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section Skeleton */}
            <div style={{ backgroundColor: '#141414', border: '1px solid #282828', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div className="sq-skeleton" style={{ height: '20px', width: '210px', marginBottom: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '84px', borderRadius: '10px' }} />
                    ))}
                </div>
            </div>

            {/* Modules Section Skeleton */}
            <div style={{ backgroundColor: '#141414', border: '1px solid #282828', borderRadius: '16px', padding: '22px' }}>
                <div className="sq-skeleton" style={{ height: '20px', width: '190px', marginBottom: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '42px', borderRadius: '10px' }} />
                    ))}
                </div>
            </div>
        </div>
    )
}
