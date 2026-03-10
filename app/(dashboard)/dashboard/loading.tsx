export default function DashboardPageLoading() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <div className="sq-skeleton" style={{ height: '14px', width: '210px', marginBottom: '10px' }} />
                <div className="sq-skeleton" style={{ height: '34px', width: '320px', maxWidth: '100%' }} />
            </div>

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '72px', marginBottom: '14px' }} />
                    <div className="sq-skeleton" style={{ height: '8px', marginBottom: '10px' }} />
                    <div className="sq-skeleton" style={{ height: '8px', width: '74%', marginBottom: '14px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                        <div className="sq-skeleton" style={{ height: '56px' }} />
                    </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '20px', width: '120px', marginBottom: '16px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="sq-skeleton" style={{ height: '80px' }} />
                        <div className="sq-skeleton" style={{ height: '80px' }} />
                        <div className="sq-skeleton" style={{ height: '80px' }} />
                        <div className="sq-skeleton" style={{ height: '80px' }} />
                    </div>
                </div>
            </div>

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '20px', width: '140px', marginBottom: '14px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', marginBottom: '8px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', marginBottom: '8px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '80%' }} />
                </div>
                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '20px', width: '160px', marginBottom: '14px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', marginBottom: '8px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', marginBottom: '8px' }} />
                    <div className="sq-skeleton" style={{ height: '14px', width: '72%' }} />
                </div>
            </div>
        </div>
    )
}
