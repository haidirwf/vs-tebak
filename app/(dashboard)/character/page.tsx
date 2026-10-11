'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, calculateCharacterStats, EquippedItemsMap, resolveEquippedMap } from '@/lib/game/character'
import { GAME_ITEMS, GameItem, ItemSlot, ItemRarity, RARITY_CONFIG, getItemRarityRank, getItemsBySlot, getStarterItemsForClass } from '@/lib/game/items'
import { createClient } from '@/lib/supabase/client'
import CharacterVisual from '@/components/character/CharacterVisual'
import ItemIcon from '@/components/character/ItemIcon'
import ItemDetailModal from '@/components/character/ItemDetailModal'
import {
    Swords,
    Shield,
    Sparkles,
    Zap,
    Coins,
    Check,
    ArrowRight,
    ShoppingBag,
    Package,
    Info,
    Clock,
    Flame,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    SlidersHorizontal,
    ChevronRight,
} from 'lucide-react'

const RARITY_META: Record<ItemRarity, { weight: number; stars: number; starText: string; tierLabel: string }> = {
    common: { weight: 1, stars: 1, starText: '★☆☆☆', tierLabel: 'Tier I' },
    rare: { weight: 2, stars: 2, starText: '★★☆☆', tierLabel: 'Tier II' },
    epic: { weight: 3, stars: 3, starText: '★★★☆', tierLabel: 'Tier III' },
    legendary: { weight: 4, stars: 4, starText: '★★★★', tierLabel: 'Tier IV' },
}

const SLOT_LABELS: Record<ItemSlot, { name: string; emoji: string }> = {
    weapon: { name: 'Senjata', emoji: '🗡️' },
    head: { name: 'Kepala', emoji: '🪖' },
    armor: { name: 'Zirah', emoji: '🛡️' },
    accessory: { name: 'Aksesoris', emoji: '💍' },
}

export default function CharacterPage() {
    const supabase = useMemo(() => createClient(), [])
    const { profile, updateXP } = useUserStore()
    const { 
        characterEquipped, 
        characterInventory, 
        characterInventoryFetchedAt, 
        setCharacterInventoryData 
    } = useContentStore()

    const isFetchingRef = useRef(false)
    const hasFetchedRef = useRef(false)

    const avatarClass = (profile?.avatar_class || 'warrior') as AvatarClass
    const roleInfo = CHARACTER_ROLES[avatarClass] || CHARACTER_ROLES.warrior

    // 1. Initial equipped determination:
    // Memory cache in contentStore -> profile.equipped_items in userStore -> starter items fallback
    const resolvedInitialEquipped = useMemo(() => {
        if (characterEquipped && Object.keys(characterEquipped).length > 0) {
            return characterEquipped
        }
        return resolveEquippedMap(avatarClass, profile?.equipped_items, profile?.character_created ?? true)
    }, [characterEquipped, avatarClass, profile?.equipped_items, profile?.character_created])

    // 2. Initial inventory determination:
    // Memory cache in contentStore -> starter items for created character -> empty
    const resolvedInitialInventory = useMemo(() => {
        if (characterInventory && characterInventory.length > 0) {
            return characterInventory
        }
        if (profile?.character_created ?? true) {
            return getStarterItemsForClass(avatarClass)
        }
        return []
    }, [characterInventory, avatarClass, profile?.character_created])

    const [activeTab, setActiveTab] = useState<'inventory' | 'perks'>('inventory')
    const [selectedSlotFilter, setSelectedSlotFilter] = useState<'all' | ItemSlot>('all')
    const [equipped, setEquipped] = useState<EquippedItemsMap>(resolvedInitialEquipped)
    const [inventory, setInventory] = useState<GameItem[]>(resolvedInitialInventory)
    const [isLoadingData, setIsLoadingData] = useState(!characterInventoryFetchedAt && !profile?.character_created)
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [previewItem, setPreviewItem] = useState<GameItem | null>(null)

    const navTabsRef = useRef<HTMLDivElement>(null)
    const filterTabsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Open preview item if specified in URL query (?item=id)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const targetItemId = params.get('item')
            if (targetItemId) {
                const found = GAME_ITEMS.find((it) => it.id === targetItemId)
                if (found) {
                    setPreviewItem(found)
                }
            }
        }
    }, [])

    const handleOpenPreview = useCallback((item: GameItem) => {
        setPreviewItem(item)
        if (typeof window !== 'undefined' && window.history.replaceState) {
            const url = new URL(window.location.href)
            url.searchParams.set('item', item.id)
            window.history.replaceState({}, '', url.toString())
        }
    }, [])

    const handleClosePreview = useCallback(() => {
        setPreviewItem(null)
        if (typeof window !== 'undefined' && window.history.replaceState) {
            const url = new URL(window.location.href)
            url.searchParams.delete('item')
            window.history.replaceState({}, '', url.toString())
        }
    }, [])

    // Smooth drag-scroll support for touch & mouse
    useEffect(() => {
        const attachDragScroll = (el: HTMLDivElement | null) => {
            if (!el) return () => {}
            let isDown = false
            let startX = 0
            let scrollLeft = 0
            let hasMoved = false

            const onMouseDown = (e: MouseEvent) => {
                isDown = true
                hasMoved = false
                startX = e.pageX - el.offsetLeft
                scrollLeft = el.scrollLeft
            }
            const onMouseLeave = () => { isDown = false }
            const onMouseUp = () => { isDown = false }
            const onMouseMove = (e: MouseEvent) => {
                if (!isDown) return
                const x = e.pageX - el.offsetLeft
                const walk = (x - startX) * 1.4
                if (Math.abs(walk) > 4) {
                    hasMoved = true
                    el.scrollLeft = scrollLeft - walk
                }
            }
            const onClickCapture = (e: MouseEvent) => {
                if (hasMoved) {
                    e.stopPropagation()
                    hasMoved = false
                }
            }

            el.addEventListener('mousedown', onMouseDown)
            el.addEventListener('mouseleave', onMouseLeave)
            el.addEventListener('mouseup', onMouseUp)
            el.addEventListener('mousemove', onMouseMove)
            el.addEventListener('click', onClickCapture, true)

            return () => {
                el.removeEventListener('mousedown', onMouseDown)
                el.removeEventListener('mouseleave', onMouseLeave)
                el.removeEventListener('mouseup', onMouseUp)
                el.removeEventListener('mousemove', onMouseMove)
                el.removeEventListener('click', onClickCapture, true)
            }
        }

        const cleanupNav = attachDragScroll(navTabsRef.current)
        const cleanupFilter = attachDragScroll(filterTabsRef.current)

        return () => {
            cleanupNav()
            cleanupFilter()
        }
    }, [activeTab])

    useEffect(() => {
        setMounted(true)
    }, [])

    // Keep local equipped & inventory in sync once when profile first loads
    useEffect(() => {
        if (profile) {
            setEquipped(prev => {
                if (Object.keys(prev).length === 0) {
                    return resolveEquippedMap(avatarClass, profile.equipped_items, profile.character_created ?? true)
                }
                return prev
            })
            setInventory(prev => {
                if (prev.length === 0) {
                    return getStarterItemsForClass(avatarClass)
                }
                return prev
            })
        }
    }, [profile?.id, avatarClass])

    // Fetch user inventory and equipped gear directly from Supabase (0 load on Vercel Serverless Functions)
    const loadInventoryData = useCallback(async (silent = false) => {
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        if (!silent) {
            setIsLoadingData(true)
        }
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Query user profile & inventory in parallel directly from Supabase PostgREST
            const [profileRes, invRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, username, avatar_class, level, xp, equipped_items, character_created')
                    .eq('id', user.id)
                    .single(),
                supabase
                    .from('user_inventory')
                    .select('id, item_id, slot, is_equipped, acquired_at')
                    .eq('user_id', user.id),
            ])

            const prof = profileRes.data
            const inventoryRows = invRes.data
            const invErr = invRes.error

            if (prof) {
                const userClass = (prof.avatar_class || 'warrior') as AvatarClass
                const profEquipped = (prof.equipped_items as Partial<Record<ItemSlot, string>>) || {}
                let ownedItemIds = new Set<string>()
                let equippedMap: Partial<Record<ItemSlot, string>> = {}

                if (invErr) {
                    equippedMap = { ...profEquipped }
                    if (prof.character_created) {
                        const starters = getStarterItemsForClass(userClass)
                        starters.forEach(it => {
                            ownedItemIds.add(it.id)
                            if (!equippedMap[it.slot]) equippedMap[it.slot] = it.id
                        })
                        Object.values(profEquipped).forEach(id => {
                            if (id) ownedItemIds.add(id)
                        })
                    }
                } else if (!inventoryRows || inventoryRows.length === 0) {
                    // Auto-grant starter items if user has already created their character
                    if (prof.character_created) {
                        const starters = getStarterItemsForClass(userClass)
                        const insertPayload = starters.map(it => ({
                            user_id: user.id,
                            item_id: it.id,
                            slot: it.slot,
                            is_equipped: true,
                        }))

                        await supabase.from('user_inventory').upsert(insertPayload, { onConflict: 'user_id, item_id' })
                        starters.forEach(it => {
                            ownedItemIds.add(it.id)
                            equippedMap[it.slot] = it.id
                        })

                        await supabase.from('profiles').update({
                            equipped_items: equippedMap,
                        }).eq('id', user.id)
                    }
                } else {
                    inventoryRows.forEach(row => {
                        ownedItemIds.add(row.item_id)
                        if (row.is_equipped) {
                            equippedMap[row.slot as ItemSlot] = row.item_id
                        }
                    })

                    if (Object.keys(equippedMap).length === 0 && Object.keys(profEquipped).length > 0) {
                        equippedMap = { ...profEquipped }
                    }

                    if (prof.character_created) {
                        const starters = getStarterItemsForClass(userClass)
                        starters.forEach(it => {
                            ownedItemIds.add(it.id)
                            if (!equippedMap[it.slot]) {
                                equippedMap[it.slot] = it.id
                            }
                        })
                    }
                }

                const serverInventory = GAME_ITEMS.filter(it => ownedItemIds.has(it.id))
                const finalInventory = serverInventory.length > 0 ? serverInventory : getStarterItemsForClass(userClass)
                const finalEquipped = Object.keys(equippedMap).length > 0 ? equippedMap : resolveEquippedMap(userClass, equippedMap, true)

                setEquipped(finalEquipped)
                setInventory(finalInventory)

                // Update caches in contentStore
                useContentStore.getState().setCharacterInventoryData({
                    equipped: finalEquipped,
                    inventory: finalInventory,
                })

                const currentProfile = useUserStore.getState().profile
                if (currentProfile) {
                    useUserStore.setState({
                        profile: {
                            ...currentProfile,
                            avatar_class: userClass,
                            equipped_items: finalEquipped,
                        }
                    })
                }
            }
        } catch (e) {
            console.error('Failed to load character inventory directly from Supabase:', e)
        } finally {
            isFetchingRef.current = false
            setIsLoadingData(false)
        }
    }, [supabase])

    useEffect(() => {
        if (hasFetchedRef.current) return
        hasFetchedRef.current = true

        const fetchedAt = useContentStore.getState().characterInventoryFetchedAt
        const isFresh = Boolean(fetchedAt && Date.now() - fetchedAt < 60_000)
        if (isFresh) {
            loadInventoryData(true)
        } else {
            loadInventoryData(false)
        }
    }, [loadInventoryData])

    // Auto-dismiss floating toast notification
    useEffect(() => {
        if (!notification) return
        const timer = setTimeout(() => {
            setNotification(null)
        }, 3200)
        return () => clearTimeout(timer)
    }, [notification])

    // Compute total character stats
    const characterStats = useMemo(() => {
        return calculateCharacterStats(avatarClass, profile?.level || 1, equipped)
    }, [avatarClass, profile?.level, equipped])

    // Owned item IDs set
    const ownedIds = useMemo(() => {
        return new Set(inventory.map(it => it.id))
    }, [inventory])

    // Handle Equip or Unequip with Instant Optimistic UI
    async function handleEquipToggle(item: GameItem, action: 'equip' | 'unequip') {
        setActionLoadingId(item.id)
        setNotification(null)

        // 1. Optimistic update
        const previousEquipped = { ...equipped }
        const newEquipped = { ...equipped }
        if (action === 'equip') {
            newEquipped[item.slot] = item.id
        } else {
            delete newEquipped[item.slot]
        }

        // Apply immediately in 0ms
        setEquipped(newEquipped)
        if (profile) {
            useUserStore.getState().setProfile({
                ...profile,
                equipped_items: newEquipped,
            })
        }
        setCharacterInventoryData({
            equipped: newEquipped,
            inventory,
        })

        // 2. Persist directly to Supabase PostgREST (0 load on Vercel Serverless Functions)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Pengguna tidak terautentikasi')

            // Update user_inventory table
            if (action === 'equip') {
                await supabase
                    .from('user_inventory')
                    .update({ is_equipped: false })
                    .eq('user_id', user.id)
                    .eq('slot', item.slot)

                await supabase
                    .from('user_inventory')
                    .update({ is_equipped: true })
                    .eq('user_id', user.id)
                    .eq('item_id', item.id)
            } else {
                await supabase
                    .from('user_inventory')
                    .update({ is_equipped: false })
                    .eq('user_id', user.id)
                    .eq('slot', item.slot)
            }

            // Persist to profiles.equipped_items
            const { error: profUpdateErr } = await supabase
                .from('profiles')
                .update({ equipped_items: newEquipped })
                .eq('id', user.id)

            if (profUpdateErr) {
                throw new Error(profUpdateErr.message)
            }

            setNotification({ 
                type: 'success', 
                message: action === 'equip' ? `${item.name} berhasil dipakai!` : `${item.name} dilepas.` 
            })
        } catch (e: any) {
            // Rollback on failure
            setEquipped(previousEquipped)
            if (profile) {
                useUserStore.getState().setProfile({
                    ...profile,
                    equipped_items: previousEquipped,
                })
            }
            setCharacterInventoryData({
                equipped: previousEquipped,
                inventory,
            })
            setNotification({ type: 'error', message: e.message || 'Gagal mengubah perlengkapan.' })
        } finally {
            setActionLoadingId(null)
        }
    }

    // Filter inventory items (automatically sorted by rarity: Legendary -> Epic -> Rare -> Common)
    const filteredInventory = useMemo(() => {
        const items = selectedSlotFilter === 'all'
            ? [...inventory]
            : inventory.filter(it => it.slot === selectedSlotFilter)

        return items.sort((a, b) => {
            const diff = getItemRarityRank(b.rarity) - getItemRarityRank(a.rarity)
            if (diff !== 0) return diff
            return a.name.localeCompare(b.name)
        })
    }, [inventory, selectedSlotFilter])


    const slotCounts = useMemo(() => {
        return {
            all: inventory.length,
            weapon: inventory.filter(it => it.slot === 'weapon').length,
            head: inventory.filter(it => it.slot === 'head').length,
            armor: inventory.filter(it => it.slot === 'armor').length,
            accessory: inventory.filter(it => it.slot === 'accessory').length,
        }
    }, [inventory])

    const headItem = equipped.head ? GAME_ITEMS.find(it => it.id === equipped.head) || null : null
    const armorItem = equipped.armor ? GAME_ITEMS.find(it => it.id === equipped.armor) || null : null
    const weaponItem = equipped.weapon ? GAME_ITEMS.find(it => it.id === equipped.weapon) || null : null
    const accessoryItem = equipped.accessory ? GAME_ITEMS.find(it => it.id === equipped.accessory) || null : null

    const combatAttributes = useMemo(() => [
        { label: 'HP Darah', value: characterStats.hp, color: '#ef4444', icon: '❤️' },
        { label: 'ATK Serang', value: `+${characterStats.atk}`, color: '#f59e0b', icon: '⚔️' },
        { label: 'DEF Bertahan', value: characterStats.def, color: '#10b981', icon: '🛡️' },
        { label: 'CRIT Kritis', value: `${characterStats.crit}%`, color: '#a855f7', icon: '💥' },
        { label: 'Timer Ronde', value: `+${characterStats.battleBuffs.extraTimerSec}s`, color: '#38bdf8', icon: '⏱️' },
        { label: 'Bonus XP', value: `+${characterStats.battleBuffs.extraXpPct}%`, color: 'var(--color-gold-text)', icon: '⭐' },
    ], [characterStats])

    function renderSocketCard(
        slot: ItemSlot,
        item: GameItem | null,
        slotMeta: { name: string; emoji: string },
        anatomicalLabel: string
    ) {
        const rarity = item ? RARITY_CONFIG[item.rarity] : null

        return (
            <div
                key={slot}
                onClick={() => {
                    if (!item) {
                        setSelectedSlotFilter(slot)
                        const el = document.getElementById('inventory-vault')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                    } else {
                        handleOpenPreview(item)
                    }
                }}
                title={item ? `${item.name} — Klik untuk penjelasan lengkap` : `Slot ${slotMeta.name} kosong — Klik untuk memilih item`}
                style={{
                    borderRadius: '12px',
                    border: item
                        ? `1.5px solid ${rarity?.cardBorder || 'var(--surface-border)'}`
                        : '1.5px dashed var(--surface-border)',
                    background: item
                        ? 'var(--surface-card)'
                        : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: item
                        ? `0 4px 16px -4px rgba(0, 0, 0, 0.06), 0 0 10px -2px ${rarity?.border || 'transparent'}22`
                        : 'none',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    boxSizing: 'border-box',
                    minWidth: 0,
                    width: '100%',
                }}
            >
                {/* Socket Header: Slot icon + name & Anatomical hint */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <span>{slotMeta.emoji}</span>
                        <span>{slotMeta.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-steel)', fontWeight: 400 }}>
                            · {anatomicalLabel}
                        </span>
                    </span>

                    {item ? (
                        <span
                            style={{
                                fontSize: '9.5px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                color: rarity?.badgeColor,
                                backgroundColor: rarity?.badgeBg,
                                border: `1px solid ${rarity?.badgeBorder}`,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {rarity?.stars}
                        </span>
                    ) : (
                        <span
                            style={{
                                fontSize: '9.5px',
                                color: 'var(--color-steel)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--surface-elevated)',
                            }}
                        >
                            Kosong
                        </span>
                    )}
                </div>

                {/* Socket Content */}
                {item ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <ItemIcon item={item} slot={slot} size={38} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    color: `var(--rarity-title-${item.rarity})`,
                                    lineHeight: 1.25,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                            <div style={{ marginTop: '2px' }}>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: rarity?.buffColor,
                                        backgroundColor: rarity?.buffBg,
                                        border: `1px solid ${rarity?.buffBorder}`,
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    ⚡ {item.buff.label}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                border: '1.5px dashed var(--surface-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-steel)',
                                fontSize: '16px',
                                backgroundColor: 'var(--surface-elevated)',
                            }}
                        >
                            {slotMeta.emoji}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--color-steel)' }}>
                                Belum Terpasang
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-fog)', marginTop: '1px' }}>
                                Pilih dari gudang
                            </div>
                        </div>
                    </div>
                )}

                {/* Socket Footer: Quick Action & Inspect Hint */}
                {item && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
                            Lihat detail ↗
                        </span>
                        <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleEquipToggle(item, 'unequip')
                            }}
                            style={{
                                padding: '2px 8px',
                                borderRadius: '5px',
                                border: '1px solid var(--accent-red-border)',
                                backgroundColor: 'var(--accent-red-bg)',
                                color: 'var(--accent-red)',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {actionLoadingId === item.id ? '...' : 'Lepas'}
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="responsive-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            {/* Header Title & Hero Quick Status */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '22px',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '24px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            margin: '0 0 4px 0',
                            color: 'var(--text-primary)',
                        }}
                    >
                        Karakter & Perlengkapan
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        Atur perlengkapan pahlawanmu dan tingkatkan statistik tempur duel.
                    </p>
                </div>

                {/* Hero Quick Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                    }}
                >
                    <span style={{ fontSize: '14px' }}>{roleInfo.avatarEmoji}</span>
                    <span
                        style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            color: roleInfo.themeColor,
                        }}
                    >
                        {roleInfo.name} · Lv.{profile?.level || 1}
                    </span>
                    <span style={{ opacity: 0.4, color: 'var(--color-steel)' }}>•</span>
                    <span
                        style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--color-gold-text)',
                        }}
                    >
                        {profile?.xp || 0} XP
                    </span>
                </div>
            </div>

            {/* Floating Toaster for Equip/Unequip Notifications */}
            {mounted && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            className="character-toast-notification"
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.95 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                zIndex: 99999,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 18px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--surface-card)',
                                border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)'}`,
                                boxShadow: 'var(--shadow-modal)',
                                pointerEvents: 'auto',
                            }}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 size={18} style={{ color: 'var(--color-vector-green)', flexShrink: 0 }} />
                            ) : (
                                <AlertCircle size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                                {notification.message}
                            </span>
                            <button
                                type="button"
                                onClick={() => setNotification(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-steel)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '6px',
                                    marginLeft: 'auto',
                                }}
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* --- SECTION 1: HERO PAPERDOLL STUDIO (NO WHITE FRAME & BIG CHARACTER) --- */}
            <div className="character-hero-stage">
                {/* Hero Title & Lore Banner */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <div
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: isMobile ? '20px' : '24px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {profile?.username || 'Hero'}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--color-fog)', marginTop: '2px' }}>
                        {roleInfo.title} — {roleInfo.subtitle}
                    </div>
                </div>

                {/* The Paperdoll Arena (Desktop 3-Column: Head/Torso Left, Big Avatar Center, Weapon/Relic Right) */}
                <div className="character-paperdoll-grid">
                    {/* LEFT COLUMN: Kepala (Head) & Zirah (Torso) */}
                    <div className="character-paperdoll-column character-paperdoll-column-desktop" style={{ justifyContent: 'space-around', minHeight: '300px' }}>
                        {renderSocketCard('head', headItem, SLOT_LABELS.head, 'Kepala')}
                        {renderSocketCard('armor', armorItem, SLOT_LABELS.armor, 'Badan')}
                    </div>

                    {/* CENTER: Free-Standing Big Hero Visual (No Box Frame, Rich Aura, Grounded Pedestal) */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            userSelect: 'none',
                        }}
                    >
                        <CharacterVisual
                            role={avatarClass}
                            equipped={equipped}
                            size={isMobile ? 260 : 320}
                            showAura={true}
                            interactive={true}
                            showRoleBadge={false}
                        />

                        {/* 3D Pedestal Base Ground Shadow */}
                        <div
                            style={{
                                width: isMobile ? '160px' : '220px',
                                height: isMobile ? '18px' : '24px',
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${roleInfo.themeColor}38 0%, rgba(0, 0, 0, 0.28) 55%, transparent 75%)`,
                                marginTop: isMobile ? '-18px' : '-24px',
                                filter: 'blur(3px)',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    {/* RIGHT COLUMN: Senjata (Hands) & Aksesoris (Relic/Wings) */}
                    <div className="character-paperdoll-column character-paperdoll-column-desktop" style={{ justifyContent: 'space-around', minHeight: '300px' }}>
                        {renderSocketCard('weapon', weaponItem, SLOT_LABELS.weapon, 'Tangan')}
                        {renderSocketCard('accessory', accessoryItem, SLOT_LABELS.accessory, 'Relik')}
                    </div>
                </div>

                {/* MOBILE ONLY: 2x2 Anatomical Sockets Deck */}
                <div className="character-paperdoll-mobile-grid">
                    {renderSocketCard('head', headItem, SLOT_LABELS.head, 'Kepala')}
                    {renderSocketCard('weapon', weaponItem, SLOT_LABELS.weapon, 'Tangan')}
                    {renderSocketCard('armor', armorItem, SLOT_LABELS.armor, 'Badan')}
                    {renderSocketCard('accessory', accessoryItem, SLOT_LABELS.accessory, 'Relik')}
                </div>

                {/* Hero Stage Footer: Passive Perk & 6 Combat Attributes */}
                <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {/* Passive Perk Banner */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            backgroundColor: `${roleInfo.themeColor}12`,
                            border: `1px solid ${roleInfo.themeColor}33`,
                            fontSize: '12px',
                        }}
                    >
                        <Zap size={14} style={{ color: roleInfo.themeColor, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: roleInfo.themeColor }}>
                            Perk Pasif {roleInfo.perk.name}:
                        </span>
                        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                            {roleInfo.perk.effect}
                        </span>
                    </div>

                    {/* 6 Combat Attribute Chips */}
                    <div className="character-attributes-grid">
                        {combatAttributes.map((attr) => (
                            <div
                                key={attr.label}
                                style={{
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px solid var(--surface-border)',
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                }}
                            >
                                <div style={{ fontSize: '10.5px', color: 'var(--color-steel)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{attr.icon}</span>
                                    <span>{attr.label}</span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: attr.color, fontFamily: 'var(--font-mono)' }}>
                                    {attr.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: GUDANG PERLENGKAPAN (ARMORY & INVENTORY) --- */}
            <div
                id="inventory-vault"
                style={{
                    borderRadius: '16px',
                    border: '1px solid var(--surface-border)',
                    backgroundColor: 'var(--surface-card)',
                    padding: isMobile ? '16px 14px' : '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: 'var(--shadow-card)',
                    boxSizing: 'border-box',
                }}
            >
                {/* Vault Section Header: Title & Direct Links */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '12px',
                        paddingBottom: '14px',
                        borderBottom: '1px solid var(--surface-border)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Shield size={18} style={{ color: 'var(--accent-gold-text)' }} />
                            <h2
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    margin: 0,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Gudang Perlengkapan
                            </h2>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            Pilih item dari koleksimu untuk dipasangkan ke tubuh pahlawan.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                        {/* Tab Toggle: Inventori vs Panduan Role */}
                        <div
                            ref={navTabsRef}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: 'var(--surface-elevated)',
                                padding: '3px',
                                borderRadius: '9px',
                                border: '1px solid var(--surface-border)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setActiveTab('inventory')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'inventory' ? 'var(--surface-card)' : 'transparent',
                                    color: activeTab === 'inventory' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    boxShadow: activeTab === 'inventory' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Package size={14} />
                                <span>Inventori ({inventory.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('perks')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'perks' ? 'var(--surface-card)' : 'transparent',
                                    color: activeTab === 'perks' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    boxShadow: activeTab === 'perks' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Info size={14} />
                                <span>Panduan Role</span>
                            </button>
                        </div>

                        {/* Toko CTA */}
                        <Link
                            href="/shop?tab=items"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '9px',
                                border: '1px solid var(--accent-gold-border)',
                                backgroundColor: 'var(--accent-gold-bg)',
                                color: 'var(--accent-gold-text)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease',
                                marginLeft: isMobile ? 'auto' : '0',
                            }}
                        >
                            <ShoppingBag size={14} />
                            <span>Buka Toko ↗</span>
                        </Link>
                    </div>
                </div>

                {/* Slot Filter Buttons (For Inventory) */}
                {activeTab === 'inventory' && (
                    <div ref={filterTabsRef} className="character-filter-tabs">
                        {[
                            { key: 'all' as const, label: `Semua (${slotCounts.all})`, icon: '🎒' },
                            { key: 'head' as const, label: `Kepala (${slotCounts.head})`, icon: '🪖' },
                            { key: 'armor' as const, label: `Badan (${slotCounts.armor})`, icon: '🛡️' },
                            { key: 'weapon' as const, label: `Tangan (${slotCounts.weapon})`, icon: '🗡️' },
                            { key: 'accessory' as const, label: `Relik (${slotCounts.accessory})`, icon: '💍' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setSelectedSlotFilter(tab.key)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${selectedSlotFilter === tab.key ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                                    backgroundColor: selectedSlotFilter === tab.key ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                                    color: selectedSlotFilter === tab.key ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                    fontSize: '11.5px',
                                    fontWeight: selectedSlotFilter === tab.key ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                    {/* TAB 1: INVENTORY ITEMS */}
                    {activeTab === 'inventory' && (
                        <div>
                            {isLoadingData ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-fog)' }}>
                                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                                    <span>Memuat inventori pahlawan...</span>
                                </div>
                            ) : filteredInventory.length === 0 ? (
                                <div
                                    style={{
                                        padding: '36px',
                                        textAlign: 'center',
                                        backgroundColor: 'var(--surface-elevated)',
                                        borderRadius: '12px',
                                        border: '1px dashed var(--surface-border)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    <Package size={28} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                                    <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                                        Belum ada item di slot ini.
                                    </p>
                                    <Link
                                        href="/shop?tab=items"
                                        className="btn-signal-orange"
                                        style={{
                                            padding: '8px 18px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <ShoppingBag size={14} /> Buka Toko Aksesoris <ChevronRight size={13} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="character-items-grid">
                                    {filteredInventory.map((item) => {
                                        const isEquipped = equipped[item.slot] === item.id
                                        const rarity = RARITY_CONFIG[item.rarity]
                                        const slotMeta = SLOT_LABELS[item.slot]

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleOpenPreview(item)}
                                                className={`rarity-card-tier rarity-card-${item.rarity}`}
                                                title={`${item.name} — Klik untuk penjelasan lengkap`}
                                                style={{
                                                    padding: '14px 13px',
                                                    background: rarity.cardBg,
                                                    border: isEquipped ? '1.5px solid var(--accent-gold-border)' : `1.5px solid ${rarity.cardBorder}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    gap: '8px',
                                                    boxShadow: isEquipped ? '0 0 16px rgba(245, 158, 11, 0.25)' : rarity.cardShadow,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
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
                                                            zIndex: 3,
                                                        }}
                                                    />
                                                )}

                                                {/* Sheen Overlay */}
                                                {rarity.sheenOverlay && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: rarity.sheenOverlay,
                                                            pointerEvents: 'none',
                                                            zIndex: 1,
                                                        }}
                                                    />
                                                )}

                                                <div style={{ position: 'relative', zIndex: 2 }}>
                                                    {/* Header: Slot Badge & Rarity / Equipped status */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                                                        <span
                                                            style={{
                                                                fontSize: '10.5px',
                                                                color: 'var(--text-secondary)',
                                                                backgroundColor: 'var(--surface-elevated)',
                                                                padding: '2px 7px',
                                                                borderRadius: '6px',
                                                                border: '1px solid var(--surface-border)',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {slotMeta?.emoji} {slotMeta?.name}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            {isEquipped && (
                                                                <span
                                                                    style={{
                                                                        fontSize: '10px',
                                                                        fontWeight: 700,
                                                                        padding: '2px 6px',
                                                                        borderRadius: '5px',
                                                                        color: 'var(--accent-gold-text)',
                                                                        backgroundColor: 'var(--accent-gold-bg)',
                                                                        border: '1px solid var(--accent-gold-border)',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    Aktif
                                                                </span>
                                                            )}
                                                            <span
                                                                style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: 700,
                                                                    padding: '2px 7px',
                                                                    borderRadius: '6px',
                                                                    color: rarity.badgeColor,
                                                                    backgroundColor: rarity.badgeBg,
                                                                    border: `1px solid ${rarity.badgeBorder}`,
                                                                    whiteSpace: 'nowrap',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '3px',
                                                                    textShadow:
                                                                        item.rarity === 'legendary'
                                                                            ? '0 0 8px rgba(251, 191, 36, 0.45)'
                                                                            : item.rarity === 'epic'
                                                                            ? '0 0 6px rgba(192, 132, 252, 0.35)'
                                                                            : 'none',
                                                                }}
                                                            >
                                                                <span>{rarity.stars}</span>
                                                                <span>{rarity.label}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Icon & Title */}
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                                        <ItemIcon item={item} size={44} />
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div
                                                                style={{
                                                                    fontFamily: 'var(--font-heading)',
                                                                    fontSize: '13.5px',
                                                                    fontWeight: 700,
                                                                    color: `var(--rarity-title-${item.rarity})`,
                                                                    lineHeight: 1.3,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    textShadow:
                                                                        item.rarity === 'legendary'
                                                                            ? '0 1px 8px rgba(245, 158, 11, 0.25)'
                                                                            : 'none',
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            <div style={{ marginTop: '4px' }}>
                                                                <span
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '3px',
                                                                        fontSize: '10.5px',
                                                                        fontWeight: 600,
                                                                        color: rarity.buffColor,
                                                                        backgroundColor: rarity.buffBg,
                                                                        border: `1px solid ${rarity.buffBorder}`,
                                                                        padding: '2px 6px',
                                                                        borderRadius: '5px',
                                                                        lineHeight: 1.25,
                                                                    }}
                                                                >
                                                                    ⚡ {item.buff.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p
                                                        style={{
                                                            fontSize: '11.5px',
                                                            color: 'var(--text-secondary)',
                                                            margin: '0 0 6px 0',
                                                            lineHeight: 1.45,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            minHeight: '2.8em',
                                                        }}
                                                    >
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Action Button */}
                                                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--surface-border)' }}>
                                                    {isEquipped ? (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEquipToggle(item, 'unequip')
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 10px',
                                                                borderRadius: '7px',
                                                                border: '1px solid var(--accent-red-border)',
                                                                backgroundColor: 'var(--accent-red-bg)',
                                                                color: 'var(--accent-red)',
                                                                fontSize: '11.5px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s ease',
                                                            }}
                                                        >
                                                            {actionLoadingId === item.id ? '...' : 'Lepas'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEquipToggle(item, 'equip')
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 10px',
                                                                borderRadius: '7px',
                                                                border: '1px solid var(--brand-primary-border)',
                                                                background: 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)',
                                                                color: '#18181b',
                                                                boxShadow: 'var(--shadow-signal-orange)',
                                                                fontSize: '11.5px',
                                                                fontWeight: 700,
                                                                fontFamily: 'var(--font-heading)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s ease',
                                                            }}
                                                        >
                                                            {actionLoadingId === item.id ? '...' : 'Pakai'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: ROLE TRAITS & BATTLE GUIDE */}
                    {activeTab === 'perks' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {(['warrior', 'mage', 'archer', 'healer'] as AvatarClass[]).map(rKey => {
                                const r = CHARACTER_ROLES[rKey]
                                const isCurrent = avatarClass === rKey

                                return (
                                    <div
                                        key={rKey}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            backgroundColor: 'var(--surface-elevated)',
                                            border: `1px solid ${isCurrent ? 'rgba(245, 197, 66, 0.4)' : 'var(--surface-border)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '22px' }}>{r.avatarEmoji}</span>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        {r.name} — {r.title}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-steel)', marginLeft: '8px' }}>
                                                        {r.subtitle}
                                                    </span>
                                                </div>
                                            </div>
                                            {isCurrent && (
                                                <span
                                                    style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'var(--accent-gold-bg)',
                                                        color: 'var(--accent-gold-text)',
                                                        border: '1px solid var(--accent-gold-border)',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Role Aktif
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ fontSize: '12px', color: 'var(--color-fog)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                                            {r.description}
                                        </p>

                                        <div style={{ fontSize: '11px', color: r.themeColor, fontWeight: 700 }}>
                                            ⚡ Efek Tempur: {r.perk.effect}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
            </div>

            {/* ITEM DETAIL & PREVIEW MODAL */}
            {mounted && typeof document !== 'undefined' && createPortal(
                <ItemDetailModal
                    item={previewItem}
                    isOpen={Boolean(previewItem)}
                    onClose={handleClosePreview}
                    isEquipped={previewItem ? equipped[previewItem.slot] === previewItem.id : false}
                    onEquipToggle={(item, action) => handleEquipToggle(item, action)}
                    actionLoading={actionLoadingId === previewItem?.id}
                    currentlyEquippedInSlot={
                        previewItem
                            ? (equipped[previewItem.slot]
                                ? GAME_ITEMS.find((it) => it.id === equipped[previewItem.slot]) || null
                                : null)
                            : null
                    }
                    playerRole={avatarClass}
                    userXp={profile?.xp || 0}
                    isInInventory={previewItem ? inventory.some((it) => it.id === previewItem.id) : false}
                />,
                document.body
            )}
        </div>
    )
}
