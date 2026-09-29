export default function DashboardLoading() {
    return (
        <div style={{ width: '100%', height: '3px', position: 'relative', overflow: 'hidden' }}>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    backgroundColor: 'var(--accent-gold)',
                    width: '35%',
                    animation: 'indeterminateProgress 1.2s infinite ease-in-out',
                }}
            />
            <style>{`
                @keyframes indeterminateProgress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(350%); }
                }
            `}</style>
        </div>
    )
}
