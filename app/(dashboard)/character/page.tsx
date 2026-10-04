'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, calculateCharacterStats, EquippedItemsMap, resolveEquippedMap } from '@/lib/game/character'
import { GAME_ITEMS, GameItem, ItemSlot, ItemRarity, RARITY_CONFIG, getItemsBySlot, getStarterItemsForClass } from '@/lib/game/items'
import { createClient } from '@/lib/supabase/client'
import CharacterVisual from '@/components/character/CharacterVisual'
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

    const navTabsRef = useRef<HTMLDivElement>(null)
    const filterTabsRef = useRef<HTMLDivElement>(null)

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

    // Filter inventory items
    const filteredInventory = useMemo(() => {
        if (selectedSlotFilter === 'all') return inventory
        return inventory.filter(it => it.slot === selectedSlotFilter)
    }, [inventory, selectedSlotFilter])


    return (
        <div className="responsive-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Title & XP Balance */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '26px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            marginBottom: '4px',
                            color: '#ffffff',
                        }}
                    >
                        🛡️ Karakter & Kostum
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        Atur perlengkapan tempur pahlawanmu dan tingkatkan buff duelmu.
                    </p>
                </div>
            </div>

            {/* Floating Toaster for Equip/Unequip/Buy Notifications (Portal to body so it stays fixed to viewport during page scroll) */}
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
                                backgroundColor: '#141414',
                                border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)'}`,
                                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255, 255, 255, 0.15)',
                                pointerEvents: 'auto',
                            }}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 size={18} style={{ color: 'var(--color-vector-green)', flexShrink: 0 }} />
                            ) : (
                                <AlertCircle size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500, lineHeight: 1.4 }}>
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

            {/* Main 2-Column Customization Grid */}
            <div className="character-main-grid">
                {/* LEFT COLUMN: Character Stage & Equipment Sockets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Character Stage Card */}
                    <div
                        style={{
                            padding: '22px 20px',
                            borderRadius: '16px',
                            border: '1px solid #313131',
                            backgroundColor: '#141414',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Role & Level Pill */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: `${roleInfo.themeColor}18`,
                                border: `1px solid ${roleInfo.themeColor}44`,
                                color: roleInfo.themeColor,
                                fontSize: '11px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '12px',
                            }}
                        >
                            <span>{roleInfo.avatarEmoji}</span>
                            <span>{roleInfo.name} · Lv.{profile?.level || 1}</span>
                            <span style={{ opacity: 0.5 }}>•</span>
                            <span style={{ color: '#F5C542', fontFamily: 'var(--font-mono)' }}>{profile?.xp || 0} XP</span>
                        </div>

                        {/* Visual Stage */}
                        <CharacterVisual
                            role={avatarClass}
                            equipped={equipped}
                            size={190}
                            showAura={true}
                            interactive={true}
                            showRoleBadge={false}
                        />

                        {/* Hero Name & Lore */}
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {profile?.username || 'Hero'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-fog)', marginTop: '2px' }}>
                                {roleInfo.title} — {roleInfo.subtitle}
                            </div>
                        </div>

                        {/* Special Perk Highlight */}
                        <div
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                fontSize: '11px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: roleInfo.themeColor, fontWeight: 700, marginBottom: '2px' }}>
                                <Zap size={13} />
                                <span>Perk Pasif: {roleInfo.perk.name}</span>
                            </div>
                            <div style={{ color: 'var(--color-steel)', lineHeight: 1.4 }}>
                                {roleInfo.perk.effect}
                            </div>
                        </div>
                    </div>

                    {/* Active Equipment Slots Card */}
                    <div
                        style={{
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1px solid #313131',
                            backgroundColor: '#141414',
                        }}
                    >
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>
                            Perlengkapan Terpasang
                        </div>

                        <div className="character-equipped-grid">
                            {(['head', 'weapon', 'armor', 'accessory'] as ItemSlot[]).map((slotKey) => {
                                const itemId = equipped[slotKey]
                                const item = itemId ? GAME_ITEMS.find(it => it.id === itemId) : null
                                const slotMeta = SLOT_LABELS[slotKey]

                                return (
                                    <div
                                        key={slotKey}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            backgroundColor: item ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                                            border: `1px solid ${item ? RARITY_CONFIG[item.rarity].border : 'rgba(255, 255, 255, 0.05)'}`,
                                            minWidth: 0,
                                            gap: '6px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                            <div
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '15px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item ? item.icon : slotMeta.emoji}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontSize: '9.5px', color: 'var(--color-steel)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                                                    {slotMeta.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: '11.5px',
                                                        fontWeight: 600,
                                                        color: item ? '#ffffff' : 'var(--color-fog)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        lineHeight: 1.25,
                                                    }}
                                                >
                                                    {item ? item.name : 'Kosong'}
                                                </div>
                                            </div>
                                        </div>

                                        {item ? (
                                            <button
                                                type="button"
                                                disabled={actionLoadingId === item.id}
                                                onClick={() => handleEquipToggle(item, 'unequip')}
                                                style={{
                                                    padding: '3px 7px',
                                                    borderRadius: '5px',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    color: 'var(--accent-red)',
                                                    fontSize: '10.5px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                Lepas
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: 'var(--color-steel)', flexShrink: 0, paddingRight: '4px' }}>
                                                —
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Battle Buffs Summary Card */}
                    <div
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            backgroundColor: '#141414',
                            border: '1px solid #313131',
                        }}
                    >
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                                Total Atribut & Buff Tempur:
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>HP Darah</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                                    {characterStats.hp}
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>ATK Serang</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                                    +{characterStats.atk}
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>DEF Bertahan</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                                    {characterStats.def}
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>CRIT Kritis</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                                    {characterStats.crit}%
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Waktu Timer</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                                    +{characterStats.battleBuffs.extraTimerSec}s
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Bonus XP</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5C542', fontFamily: 'var(--font-mono)' }}>
                                    +{characterStats.battleBuffs.extraXpPct}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Unified Inventory & Shop Box */}
                <div
                    className="card character-right-column"
                    style={{
                        padding: '20px',
                        backgroundColor: '#141414',
                        border: '1px solid #313131',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Navigation Tabs */}
                    <div ref={navTabsRef} className="character-nav-tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('inventory')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: activeTab === 'inventory' ? '1px solid rgba(245, 197, 66, 0.35)' : '1px solid transparent',
                                backgroundColor: activeTab === 'inventory' ? 'rgba(245, 197, 66, 0.12)' : 'transparent',
                                color: activeTab === 'inventory' ? '#F5C542' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <Package size={15} />
                            <span>Inventori ({inventory.length})</span>
                        </button>

                        <Link
                            href="/shop?tab=items"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                color: 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <ShoppingBag size={15} />
                            <span>Buka Toko ↗</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setActiveTab('perks')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: activeTab === 'perks' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                                backgroundColor: activeTab === 'perks' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                color: activeTab === 'perks' ? '#10b981' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <Info size={15} />
                            <span>Panduan Role</span>
                        </button>
                    </div>

                    {/* Slot Filter Buttons (For Inventory & Shop) */}
                    {activeTab !== 'perks' && (
                        <div ref={filterTabsRef} className="character-filter-tabs">
                            {(['all', 'weapon', 'head', 'armor', 'accessory'] as const).map(flt => (
                                <button
                                    key={flt}
                                    type="button"
                                    onClick={() => setSelectedSlotFilter(flt)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${selectedSlotFilter === flt ? 'rgba(245, 197, 66, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        backgroundColor: selectedSlotFilter === flt ? 'rgba(245, 197, 66, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        color: selectedSlotFilter === flt ? '#F5C542' : 'var(--color-steel)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {flt === 'all' ? 'Semua Slot' : `${SLOT_LABELS[flt].emoji} ${SLOT_LABELS[flt].name}`}
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '12px',
                                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                                        color: 'var(--color-fog)',
                                    }}
                                >
                                    <Package size={28} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                                    <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                                        Belum ada item di slot ini.
                                    </p>
                                    <Link
                                        href="/shop?tab=items"
                                        style={{
                                            display: 'inline-block',
                                            padding: '8px 18px',
                                            borderRadius: '8px',
                                            backgroundColor: '#F5C542',
                                            color: '#050505',
                                            border: 'none',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-heading)',
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Buka Toko Aksesoris ↗
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
                                                style={{
                                                    padding: '14px 12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#141414',
                                                    border: `1px solid ${isEquipped ? 'rgba(245, 197, 66, 0.45)' : rarity.border}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    gap: '8px',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {/* Corner Ambient Glow for Rarity */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-25px',
                                                        right: '-25px',
                                                        width: '85px',
                                                        height: '85px',
                                                        background: `radial-gradient(circle, ${rarity.bg} 0%, transparent 70%)`,
                                                        pointerEvents: 'none',
                                                    }}
                                                />

                                                <div>
                                                    {/* Header: Slot Badge & Rarity / Equipped status */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                                                        <span
                                                            style={{
                                                                fontSize: '10.5px',
                                                                color: 'var(--text-secondary)',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                                padding: '2px 7px',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                                                                        color: '#F5C542',
                                                                        backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                                                        border: '1px solid rgba(245, 197, 66, 0.35)',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    Aktif
                                                                </span>
                                                            )}
                                                            <span
                                                                style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: 600,
                                                                    padding: '2px 7px',
                                                                    borderRadius: '6px',
                                                                    color: rarity.color,
                                                                    backgroundColor: rarity.bg,
                                                                    border: `1px solid ${rarity.border}`,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {rarity.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Icon & Title */}
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                                        <div
                                                            style={{
                                                                width: '42px',
                                                                height: '42px',
                                                                borderRadius: '10px',
                                                                backgroundColor: rarity.bg,
                                                                border: `1px solid ${rarity.border}`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '22px',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {item.icon}
                                                        </div>
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div
                                                                style={{
                                                                    fontFamily: 'var(--font-heading)',
                                                                    fontSize: '13.5px',
                                                                    fontWeight: 600,
                                                                    color: '#ffffff',
                                                                    lineHeight: 1.3,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
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
                                                                        color: 'var(--color-vector-green)',
                                                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                                        border: '1px solid rgba(34, 197, 94, 0.28)',
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
                                                <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                                    {isEquipped ? (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={() => handleEquipToggle(item, 'unequip')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 10px',
                                                                borderRadius: '7px',
                                                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
                                                            onClick={() => handleEquipToggle(item, 'equip')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 10px',
                                                                borderRadius: '7px',
                                                                border: 'none',
                                                                backgroundColor: '#F5C542',
                                                                color: '#050505',
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
                                            backgroundColor: '#161616',
                                            border: `1px solid ${isCurrent ? 'rgba(245, 197, 66, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '22px' }}>{r.avatarEmoji}</span>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
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
                                                        backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                                        color: '#F5C542',
                                                        border: '1px solid rgba(245, 197, 66, 0.35)',
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
            </div>
        </div>
    )
}
