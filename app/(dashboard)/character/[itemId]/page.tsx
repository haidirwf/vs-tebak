'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Shield,
    Swords,
    Sparkles,
    Zap,
    Clock,
    ShoppingBag,
    CheckCircle2,
    Crown,
    Share2,
    Check,
    UserCheck,
} from 'lucide-react'
import {
    GAME_ITEMS,
    GameItem,
    ItemSlot,
    ItemBuff,
    RARITY_CONFIG,
} from '@/lib/game/items'
import { CHARACTER_ROLES } from '@/lib/game/character'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import ItemIcon from '@/components/character/ItemIcon'

const ANATOMICAL_INFO: Record<ItemSlot, { name: string; position: string; emoji: string; desc: string }> = {
    head: {
        name: 'Pelindung Kepala',
        position: 'Kepala & Mahkota',
        emoji: '🪖',
        desc: 'Melindungi konsentrasi dan pemikiran analitis saat menyelesaikan teka-teki logika pemrograman.',
    },
    armor: {
        name: 'Zirah Pelindung',
        position: 'Tubuh & Dada',
        emoji: '🛡️',
        desc: 'Meredam dampak mental dan melindungi pahlawan dari penalti kesalahan taktis.',
    },
    weapon: {
        name: 'Senjata Utama',
        position: 'Tangan & Lengan',
        emoji: '🗡️',
        desc: 'Instrumen tempur utama untuk melancarkan poin serangan ke musuh dalam duel 1v1.',
    },
    accessory: {
        name: 'Relik Magis',
        position: 'Aura & Jiwa',
        emoji: '💍',
        desc: 'Artefak pelengkap yang memberikan keunggulan pasif khusus di setiap ronde duel.',
    },
}

function getBuffDetails(buff: ItemBuff) {
    switch (buff.type) {
        case 'atk_bonus':
            return {
                title: 'Bonus Poin Serangan (ATK)',
                mechanic: `Setiap jawaban benar saat duel 1v1 menghasilkan tambahan +${buff.value} poin skor langsung ke lawan. Semakin tinggi ATK, semakin cepat kamu menguras darah HP musuh.`,
                tip: 'Sangat efektif untuk menghabisi pahlawan lawan lebih cepat di ronde-ronde awal.',
                icon: <Swords size={18} style={{ color: '#f59e0b' }} />,
            }
        case 'def_bonus':
            return {
                title: 'Peredam Kerusakan (DEF)',
                mechanic: `Meredam ${buff.value}% dampak kerusakan yang diterima saat kamu melakukan kesalahan menjawab, sehingga darah HP pahlawanmu tetap terjaga.`,
                tip: 'Memberikan bantalan keamanan ekstra saat menghadapi tantangan pemrograman tingkat lanjut.',
                icon: <Shield size={18} style={{ color: '#10b981' }} />,
            }
        case 'crit_rate':
            return {
                title: 'Peluang Kritis (CRIT)',
                mechanic: `Memberikan ${buff.value}% peluang agar jawaban benarmu memicu serangan kritis dengan skor 1.5x lipat dan efek visual petir yang memukau.`,
                tip: 'Kombinasikan dengan streak jawaban benar untuk membalikkan keadaan dalam sekejap.',
                icon: <Zap size={18} style={{ color: '#a855f7' }} />,
            }
        case 'time_bonus':
            return {
                title: 'Ekstra Waktu Berpikir (TIMER)',
                mechanic: `Menambahkan +${buff.value} detik durasi berpikir di setiap ronde pertandingan, memberimu ruang lebih untuk membaca kode dan menganalisis opsi jawaban.`,
                tip: 'Sangat direkomendasikan untuk tipe soal sintaksis panjang atau algoritma bercabang.',
                icon: <Clock size={18} style={{ color: '#38bdf8' }} />,
            }
        case 'xp_bonus':
            return {
                title: 'Pengganda Pengalaman (XP BONUS)',
                mechanic: `Meningkatkan perolehan XP sebesar +${buff.value}% setelah memenangkan pertandingan duel, mempercepat peningkatan level pahlawanmu.`,
                tip: 'Gunakan saat sesi latihan intensif untuk mempercepat unlock konten baru.',
                icon: <Sparkles size={18} style={{ color: 'var(--color-gold-text)' }} />,
            }
        case 'shield_regen':
            return {
                title: 'Pemulihan Perisai (SHIELD REGEN)',
                mechanic: `Memulihkan perisai perlindungan sebesar +${buff.value} poin setiap kali kamu mempertahankan rentetan (streak) jawaban benar berturut-turut.`,
                tip: 'Membuat pahlawanmu semakin kokoh seiring berjalannya ronde.',
                icon: <Shield size={18} style={{ color: '#06b6d4' }} />,
            }
        default:
            return {
                title: 'Efek Tempur Khusus',
                mechanic: buff.label,
                tip: 'Manfaatkan buff ini untuk meningkatkan keunggulan di arena duel.',
                icon: <Sparkles size={18} style={{ color: 'var(--accent-gold-text)' }} />,
            }
    }
}

export default function ItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
    // React 19 / Next 15+ params unwrapping
    const resolvedParams = React.use(params)
    const itemId = resolvedParams?.itemId

    const { profile } = useUserStore()
    const { characterEquipped, characterInventory } = useContentStore()

    const item = useMemo(() => {
        return GAME_ITEMS.find(it => it.id === itemId) || null
    }, [itemId])

    const [copied, setCopied] = React.useState(false)

    if (!item) {
        return (
            <div className="responsive-page" style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
                <div
                    style={{
                        padding: '40px 20px',
                        backgroundColor: 'var(--surface-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--surface-border)',
                    }}
                >
                    <Shield size={36} style={{ color: 'var(--color-steel)', margin: '0 auto 12px' }} />
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                        Item Tidak Ditemukan
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 20px 0' }}>
                        Artefak atau perlengkapan dengan ID &quot;{itemId}&quot; tidak terdaftar di katalog petualangan.
                    </p>
                    <Link
                        href="/character"
                        className="btn-signal-orange"
                        style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none',
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali ke Halaman Karakter</span>
                    </Link>
                </div>
            </div>
        )
    }

    const rarity = RARITY_CONFIG[item.rarity]
    const slotInfo = ANATOMICAL_INFO[item.slot]
    const buffDetails = getBuffDetails(item.buff)
    const playerRole = profile?.avatar_class || 'warrior'
    const isUniversal = item.class_req === 'all'
    const isRoleMatch = isUniversal || item.class_req === playerRole
    const requiredRoleInfo = !isUniversal && item.class_req !== 'all' ? CHARACTER_ROLES[item.class_req] : null
    const isEquipped = characterEquipped ? characterEquipped[item.slot] === item.id : false

    const handleShare = () => {
        if (typeof window === 'undefined') return
        navigator.clipboard?.writeText(window.location.href).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="responsive-page" style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '40px' }}>
            {/* Top Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Link
                    href="/character"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                        color: 'var(--text-secondary)',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <ArrowLeft size={15} />
                    <span>Kembali ke Karakter</span>
                </Link>

                <button
                    type="button"
                    onClick={handleShare}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                        color: copied ? 'var(--color-vector-green)' : 'var(--text-secondary)',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    {copied ? <Check size={14} /> : <Share2 size={14} />}
                    <span>{copied ? 'Tautan Disalin!' : 'Bagikan Item'}</span>
                </button>
            </div>

            {/* Main Showcase Card */}
            <div
                style={{
                    borderRadius: '18px',
                    backgroundColor: 'var(--surface-card)',
                    border: `1.5px solid ${rarity.cardBorder || 'var(--surface-border)'}`,
                    boxShadow: 'var(--shadow-card)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '24px 22px',
                    position: 'relative',
                }}
            >
                {/* Top Beam Highlight */}
                {rarity.topBeam && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: item.rarity === 'legendary' ? '3px' : '2px',
                            background: rarity.topBeam,
                        }}
                    />
                )}

                {/* Header Showcase */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '24px 16px',
                        borderRadius: '14px',
                        background: `radial-gradient(circle at 50% 35%, ${rarity.color}18 0%, rgba(0, 0, 0, 0.22) 65%, transparent 100%)`,
                        border: '1px solid var(--surface-border)',
                    }}
                >
                    <div style={{ marginBottom: '14px' }}>
                        <ItemIcon item={item} slot={item.slot} size={88} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {slotInfo.emoji} {slotInfo.name}
                        </span>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                color: rarity.badgeColor,
                                backgroundColor: rarity.badgeBg,
                                border: `1px solid ${rarity.badgeBorder}`,
                            }}
                        >
                            {rarity.stars} {rarity.label}
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '24px',
                            fontWeight: 800,
                            margin: '0 0 6px 0',
                            color: `var(--rarity-title-${item.rarity})`,
                            letterSpacing: '-0.015em',
                        }}
                    >
                        {item.name}
                    </h1>

                    <div style={{ fontSize: '12.5px', color: 'var(--color-fog)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Letak Tubuh: <strong>{slotInfo.position}</strong></span>
                        <span>•</span>
                        <span>{item.is_starter ? 'Item Pemula' : item.cost_xp > 0 ? `Harga Toko: ${item.cost_xp} XP` : 'Item Khusus'}</span>
                    </div>

                    {isEquipped && (
                        <div
                            style={{
                                marginTop: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                color: 'var(--accent-gold-text)',
                                fontSize: '11.5px',
                                fontWeight: 700,
                            }}
                        >
                            <CheckCircle2 size={14} />
                            <span>Sedang Aktif Terpasang pada Pahlawan</span>
                        </div>
                    )}
                </div>

                {/* Lore Description */}
                <div
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                    }}
                >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-steel)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Deskripsi & Latar Cerita
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {item.description}
                    </p>
                </div>

                {/* Combat Mechanics Breakdown */}
                <div
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: rarity.buffBg,
                        border: `1px solid ${rarity.buffBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {buffDetails.icon}
                            <span style={{ fontSize: '14px', fontWeight: 700, color: rarity.buffColor }}>
                                {buffDetails.title}
                            </span>
                        </div>
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                                color: rarity.buffColor,
                                backgroundColor: 'var(--surface-card)',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                border: `1px solid ${rarity.buffBorder}`,
                            }}
                        >
                            {item.buff.label}
                        </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                        {buffDetails.mechanic}
                    </p>

                    <div
                        style={{
                            fontSize: '11.5px',
                            color: 'var(--color-fog)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            paddingTop: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '4px',
                        }}
                    >
                        <span style={{ color: 'var(--color-gold-text)' }}>💡</span>
                        <span>{buffDetails.tip}</span>
                    </div>
                </div>

                {/* Compatibility */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: isRoleMatch ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${isRoleMatch ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                        fontSize: '12px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={15} style={{ color: isRoleMatch ? '#10b981' : 'var(--accent-red)' }} />
                        <span style={{ color: 'var(--text-primary)' }}>
                            {isUniversal
                                ? 'Kompatibel dengan semua role pahlawan'
                                : `Khusus role ${requiredRoleInfo?.name || item.class_req}`}
                        </span>
                    </div>

                    <span style={{ fontWeight: 700, color: isRoleMatch ? '#10b981' : 'var(--accent-red)' }}>
                        {isRoleMatch ? 'Dapat Digunakan' : 'Role Berbeda'}
                    </span>
                </div>

                {/* Direct Action Link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                    <Link
                        href={`/character?item=${item.id}`}
                        className="btn-signal-orange"
                        style={{
                            padding: '10px 22px',
                            borderRadius: '9px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            fontSize: '13px',
                        }}
                    >
                        <Zap size={15} />
                        <span>Kelola di Panggung Karakter</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
