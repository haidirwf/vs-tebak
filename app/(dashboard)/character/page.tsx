'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, calculateCharacterStats, EquippedItemsMap, resolveEquippedMap } from '@/lib/game/character'
import { GAME_ITEMS, GameItem, ItemSlot, ItemRarity, RARITY_CONFIG, getItemRarityRank, getItemsBySlot, getStarterItemsForClass, formatItemStatBadges } from '@/lib/game/items'
import { createClient } from '@/lib/supabase/client'
import CharacterVisual from '@/components/character/CharacterVisual'
import ItemIcon from '@/components/character/ItemIcon'
import ItemDetailModal from '@/components/character/ItemDetailModal'
import SlotPickerModal from '@/components/character/SlotPickerModal'
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
    const [activePickerSlot, setActivePickerSlot] = useState<ItemSlot | null>(null)

    const navTabsRef = useRef<HTMLDivElement>(null)
    const filterTabsRef = useRef<HTMLDivElement>(null)

    const stageRef = useRef<HTMLDivElement>(null)
    const avatarRef = useRef<HTMLDivElement>(null)
    const headCardRef = useRef<HTMLDivElement>(null)
    const accessoryCardRef = useRef<HTMLDivElement>(null)
    const weaponCardRef = useRef<HTMLDivElement>(null)
    const armorCardRef = useRef<HTMLDivElement>(null)

    const [linePoints, setLinePoints] = useState<{
        head?: { x1: number; y1: number; x2: number; y2: number }
        accessory?: { x1: number; y1: number; x2: number; y2: number }
        weapon?: { x1: number; y1: number; x2: number; y2: number }
        armor?: { x1: number; y1: number; x2: number; y2: number }
    }>({})

    const updateLines = useCallback(() => {
        if (!stageRef.current || !avatarRef.current) return
        const stage = stageRef.current.getBoundingClientRect()
        const avatar = avatarRef.current.getBoundingClientRect()

        const avatarCenterX = avatar.left + avatar.width / 2 - stage.left
        const headTargetY = avatar.top + avatar.height * 0.16 - stage.top
        const accTargetX = avatar.left + avatar.width * 0.30 - stage.left
        const accTargetY = avatar.top + avatar.height * 0.42 - stage.top
        const wpnTargetX = avatar.left + avatar.width * 0.70 - stage.left
        const wpnTargetY = avatar.top + avatar.height * 0.42 - stage.top
        const armorTargetY = avatar.top + avatar.height * 0.54 - stage.top

        const nextPoints: typeof linePoints = {}

        if (headCardRef.current) {
            const c = headCardRef.current.getBoundingClientRect()
            nextPoints.head = {
                x1: c.left - stage.left,
                y1: c.top + c.height * 0.65 - stage.top,
                x2: avatarCenterX + 6,
                y2: headTargetY,
            }
        }

        if (accessoryCardRef.current) {
            const c = accessoryCardRef.current.getBoundingClientRect()
            nextPoints.accessory = {
                x1: c.right - stage.left,
                y1: c.top + c.height * 0.5 - stage.top,
                x2: accTargetX,
                y2: accTargetY,
            }
        }

        if (weaponCardRef.current) {
            const c = weaponCardRef.current.getBoundingClientRect()
            nextPoints.weapon = {
                x1: c.left - stage.left,
                y1: c.top + c.height * 0.5 - stage.top,
                x2: wpnTargetX,
                y2: wpnTargetY,
            }
        }

        if (armorCardRef.current) {
            const c = armorCardRef.current.getBoundingClientRect()
            nextPoints.armor = {
                x1: c.left + c.width / 2 - stage.left,
                y1: c.top - stage.top,
                x2: avatarCenterX,
                y2: armorTargetY,
            }
        }

        setLinePoints(nextPoints)
    }, [])

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        updateLines()
        const handleResize = () => updateLines()
        window.addEventListener('resize', handleResize)

        let observer: ResizeObserver | null = null
        if (stageRef.current && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => updateLines())
            observer.observe(stageRef.current)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
            if (observer) observer.disconnect()
        }
    }, [updateLines, equipped, isMobile])

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
        {
            label: 'HP Darah',
            value: characterStats.hp,
            bonus: characterStats.equipmentBonuses?.hp || 0,
            bonusDisplay: characterStats.equipmentBonuses?.hp ? `+${characterStats.equipmentBonuses.hp}` : null,
            color: '#ef4444',
            icon: '❤️'
        },
        {
            label: 'ATK Serang',
            value: `+${characterStats.atk}`,
            bonus: characterStats.equipmentBonuses?.atk || 0,
            bonusDisplay: characterStats.equipmentBonuses?.atk ? `+${characterStats.equipmentBonuses.atk}` : null,
            color: '#f59e0b',
            icon: '⚔️'
        },
        {
            label: 'DEF Bertahan',
            value: characterStats.def,
            bonus: characterStats.equipmentBonuses?.def || 0,
            bonusDisplay: characterStats.equipmentBonuses?.def ? `+${characterStats.equipmentBonuses.def}` : null,
            color: '#10b981',
            icon: '🛡️'
        },
        {
            label: 'CRIT Kritis',
            value: `${characterStats.crit}%`,
            bonus: characterStats.equipmentBonuses?.crit || 0,
            bonusDisplay: characterStats.equipmentBonuses?.crit ? `+${characterStats.equipmentBonuses.crit}%` : null,
            color: '#a855f7',
            icon: '💥'
        },
        {
            label: 'Timer Ronde',
            value: `+${characterStats.battleBuffs.extraTimerSec}s`,
            bonus: characterStats.battleBuffs.extraTimerSec || 0,
            bonusDisplay: characterStats.battleBuffs.extraTimerSec > 0 ? `+${characterStats.battleBuffs.extraTimerSec}s` : null,
            color: '#38bdf8',
            icon: '⏱️'
        },
        {
            label: 'Bonus XP',
            value: `+${characterStats.battleBuffs.extraXpPct}%`,
            bonus: (characterStats.equipmentBonuses?.xp || 0) + (characterStats.battleBuffs.extraXpPct || 0),
            bonusDisplay: ((characterStats.equipmentBonuses?.xp || 0) + (characterStats.battleBuffs.extraXpPct || 0)) > 0
                ? `+${(characterStats.equipmentBonuses?.xp || 0) + (characterStats.battleBuffs.extraXpPct || 0)}%`
                : null,
            color: 'var(--color-gold-text)',
            icon: '⭐'
        },
    ], [characterStats])

    function renderSocketCard(
        slot: ItemSlot,
        item: GameItem | null,
        slotMeta: { name: string; emoji: string },
        anatomicalLabel: string,
        cardRef?: React.RefObject<HTMLDivElement | null>
    ) {
        const rarity = item ? RARITY_CONFIG[item.rarity] : null

        return (
            <div
                key={slot}
                ref={cardRef}
                onClick={() => {
                    setActivePickerSlot(slot)
                }}
                className="character-callout-card"
                title={item ? `${item.name} — Klik untuk mengganti atau memilih item ${slotMeta.name}` : `Slot ${slotMeta.name} kosong — Klik untuk memilih item`}
                style={{
                    borderRadius: '12px',
                    border: item
                        ? `1.5px solid ${rarity?.cardBorder || 'var(--surface-border)'}`
                        : '1.5px dashed var(--surface-border)',
                    background: item
                        ? 'var(--surface-card)'
                        : 'rgba(255, 255, 255, 0.02)',
                    padding: '9px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: 'pointer',
                    position: 'relative',
                    boxSizing: 'border-box',
                    minWidth: 0,
                    width: '100%',
                }}
            >
                {/* Top Accent Line like user sketch */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: item
                            ? (rarity?.topBeam || rarity?.border || '#f59e0b')
                            : 'var(--surface-border)',
                        borderRadius: '12px 12px 0 0',
                    }}
                />

                {/* Header: Slot Emoji + Slot Name · Anatomical Label + Status Terpasang & Tombol Ganti */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
                        <span style={{ fontSize: '12px' }}>{slotMeta.emoji}</span>
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {slotMeta.name}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--color-steel)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            · {anatomicalLabel}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        {item && (
                            <span
                                style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    color: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    padding: '1px 4px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Terpasang
                            </span>
                        )}
                        <span
                            style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                color: 'var(--color-gold-text)',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.28)',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Ganti ⇄
                        </span>
                    </div>
                </div>

                {/* Body */}
                {item ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
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
                                <div style={{ fontSize: '10.5px', color: rarity?.buffColor || '#f59e0b', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    ⚡ {item.buff.label}
                                </div>
                            </div>
                        </div>

                        {/* Dedicated Stat Bonus Row: "Nambah Stat: +X HP, +Y ATK" */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '3px',
                                padding: '3px 6px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                        >
                            <span style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 700 }}>
                                Nambah:
                            </span>
                            {formatItemStatBadges(item).map((badge) => (
                                <span
                                    key={badge.key}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        fontSize: '9.5px',
                                        fontWeight: 800,
                                        color: '#34d399',
                                        backgroundColor: 'rgba(16, 185, 129, 0.16)',
                                        border: '1px solid rgba(16, 185, 129, 0.35)',
                                        padding: '1px 4px',
                                        borderRadius: '4px',
                                        fontFamily: 'var(--font-mono)',
                                    }}
                                >
                                    <span>{badge.icon}</span>
                                    <span style={{ color: '#10b981', fontWeight: 900 }}>{badge.display}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
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
                            <div style={{ fontSize: '10px', color: 'var(--accent-gold-text)', marginTop: '2px', fontWeight: 600 }}>
                                + Pilih dari Gudang
                            </div>
                        </div>
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

            {/* --- SECTION 1: HERO BLUEPRINT STUDIO (EXACT USER SKETCH LAYOUT) --- */}
            <div className="character-blueprint-canvas">
                {/* Hero Title & Lore */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '14px' : '4px', position: 'relative', zIndex: 5 }}>
                    <div
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: isMobile ? '20px' : '23px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {profile?.username || 'Hero'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-fog)', marginTop: '2px' }}>
                        {roleInfo.title} — {roleInfo.subtitle}
                    </div>
                </div>

                {/* DESKTOP BLUEPRINT ARENA (>= 860px) */}
                {!isMobile ? (
                    <div
                        ref={stageRef}
                        style={{
                            position: 'relative',
                            width: '100%',
                            minHeight: '620px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* SVG Connecting Callout Lines with Bezier Curves */}
                        <svg
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 12,
                            }}
                        >
                            {/* Head line */}
                            {linePoints.head && (
                                <g>
                                    <path
                                        d={`M ${linePoints.head.x1} ${linePoints.head.y1} C ${linePoints.head.x1 - (linePoints.head.x1 - linePoints.head.x2) * 0.45} ${linePoints.head.y1 + (linePoints.head.y2 - linePoints.head.y1) * 0.35}, ${linePoints.head.x2 + (linePoints.head.x1 - linePoints.head.x2) * 0.15} ${linePoints.head.y2 - 20}, ${linePoints.head.x2} ${linePoints.head.y2}`}
                                        fill="none"
                                        stroke="var(--callout-line)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        style={{ opacity: 0.85 }}
                                    />
                                    <circle cx={linePoints.head.x1} cy={linePoints.head.y1} r="2.5" fill="var(--callout-line)" />
                                    <circle cx={linePoints.head.x2} cy={linePoints.head.y2} r="3.5" fill="var(--callout-line)" />
                                </g>
                            )}

                            {/* Accessory line */}
                            {linePoints.accessory && (
                                <g>
                                    <path
                                        d={`M ${linePoints.accessory.x1} ${linePoints.accessory.y1} C ${linePoints.accessory.x1 + (linePoints.accessory.x2 - linePoints.accessory.x1) * 0.45} ${linePoints.accessory.y1}, ${linePoints.accessory.x1 + (linePoints.accessory.x2 - linePoints.accessory.x1) * 0.55} ${linePoints.accessory.y2}, ${linePoints.accessory.x2} ${linePoints.accessory.y2}`}
                                        fill="none"
                                        stroke="var(--callout-line)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        style={{ opacity: 0.85 }}
                                    />
                                    <circle cx={linePoints.accessory.x1} cy={linePoints.accessory.y1} r="2.5" fill="var(--callout-line)" />
                                    <circle cx={linePoints.accessory.x2} cy={linePoints.accessory.y2} r="3.5" fill="var(--callout-line)" />
                                </g>
                            )}

                            {/* Weapon line */}
                            {linePoints.weapon && (
                                <g>
                                    <path
                                        d={`M ${linePoints.weapon.x1} ${linePoints.weapon.y1} C ${linePoints.weapon.x1 - (linePoints.weapon.x1 - linePoints.weapon.x2) * 0.45} ${linePoints.weapon.y1}, ${linePoints.weapon.x1 - (linePoints.weapon.x1 - linePoints.weapon.x2) * 0.55} ${linePoints.weapon.y2}, ${linePoints.weapon.x2} ${linePoints.weapon.y2}`}
                                        fill="none"
                                        stroke="var(--callout-line)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        style={{ opacity: 0.85 }}
                                    />
                                    <circle cx={linePoints.weapon.x1} cy={linePoints.weapon.y1} r="2.5" fill="var(--callout-line)" />
                                    <circle cx={linePoints.weapon.x2} cy={linePoints.weapon.y2} r="3.5" fill="var(--callout-line)" />
                                </g>
                            )}

                            {/* Armor line */}
                            {linePoints.armor && (
                                <g>
                                    <path
                                        d={`M ${linePoints.armor.x1} ${linePoints.armor.y1} C ${linePoints.armor.x1} ${linePoints.armor.y1 - (linePoints.armor.y1 - linePoints.armor.y2) * 0.45}, ${linePoints.armor.x2} ${linePoints.armor.y2 + (linePoints.armor.y1 - linePoints.armor.y2) * 0.25}, ${linePoints.armor.x2} ${linePoints.armor.y2}`}
                                        fill="none"
                                        stroke="var(--callout-line)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        style={{ opacity: 0.85 }}
                                    />
                                    <circle cx={linePoints.armor.x1} cy={linePoints.armor.y1} r="2.5" fill="var(--callout-line)" />
                                    <circle cx={linePoints.armor.x2} cy={linePoints.armor.y2} r="3.5" fill="var(--callout-line)" />
                                </g>
                            )}
                        </svg>

                        {/* Top-Right: Kepala Card */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '12px',
                                left: 'calc(50% + 72px)',
                                width: '215px',
                                zIndex: 20,
                            }}
                        >
                            {renderSocketCard('head', headItem, SLOT_LABELS.head, 'Kepala', headCardRef)}
                        </div>

                        {/* Center: Free-Standing Big Hero Visual with Blue Dashed Pedestal */}
                        <div
                            ref={avatarRef}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '42%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                userSelect: 'none',
                                zIndex: 10,
                            }}
                        >
                            <CharacterVisual
                                role={avatarClass}
                                equipped={equipped}
                                size={260}
                                showAura={true}
                                interactive={true}
                                showRoleBadge={false}
                            />

                            {/* Blue Dashed Elliptical Pedestal Ring from user sketch */}
                            <div
                                style={{
                                    width: '160px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    border: '2px dashed #38bdf8',
                                    backgroundColor: 'rgba(56, 189, 248, 0.04)',
                                    marginTop: '-20px',
                                    pointerEvents: 'none',
                                }}
                            />
                        </div>

                        {/* Left: Aksesoris Card */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '44%',
                                transform: 'translateY(-50%)',
                                left: 'max(8px, calc(50% - 355px))',
                                width: '215px',
                                zIndex: 20,
                            }}
                        >
                            {renderSocketCard('accessory', accessoryItem, SLOT_LABELS.accessory, 'Relik', accessoryCardRef)}
                        </div>

                        {/* Right: Senjata Card */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '48%',
                                transform: 'translateY(-50%)',
                                right: 'max(8px, calc(50% - 355px))',
                                width: '215px',
                                zIndex: 20,
                            }}
                        >
                            {renderSocketCard('weapon', weaponItem, SLOT_LABELS.weapon, 'Tangan', weaponCardRef)}
                        </div>

                        {/* Bottom: Zirah Card */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '225px',
                                zIndex: 20,
                            }}
                        >
                            {renderSocketCard('armor', armorItem, SLOT_LABELS.armor, 'Badan', armorCardRef)}
                        </div>
                    </div>
                ) : (
                    /* MOBILE ARENA (< 860px) */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            <CharacterVisual
                                role={avatarClass}
                                equipped={equipped}
                                size={230}
                                showAura={true}
                                interactive={true}
                                showRoleBadge={false}
                            />
                            {/* Blue Dashed Elliptical Pedestal Ring */}
                            <div
                                style={{
                                    width: '145px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: '2px dashed #38bdf8',
                                    backgroundColor: 'rgba(56, 189, 248, 0.06)',
                                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.22)',
                                    marginTop: '-18px',
                                    pointerEvents: 'none',
                                }}
                            />
                        </div>

                        {/* 2x2 Anatomical Sockets Deck on Mobile */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', width: '100%' }}>
                            {renderSocketCard('head', headItem, SLOT_LABELS.head, 'Kepala')}
                            {renderSocketCard('weapon', weaponItem, SLOT_LABELS.weapon, 'Tangan')}
                            {renderSocketCard('armor', armorItem, SLOT_LABELS.armor, 'Badan')}
                            {renderSocketCard('accessory', accessoryItem, SLOT_LABELS.accessory, 'Relik')}
                        </div>
                    </div>
                )}

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

                    {/* Total Bonus Perlengkapan Terpasang Banner */}
                    {Object.values(characterStats.equipmentBonuses || {}).some(v => v > 0) && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#10b981' }}>
                                <Shield size={14} />
                                <span>Total Tambahan Stat dari Perlengkapan Terpasang:</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                {characterStats.equipmentBonuses.hp > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '5px' }}>
                                        ❤️ +{characterStats.equipmentBonuses.hp} HP
                                    </span>
                                )}
                                {characterStats.equipmentBonuses.atk > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '5px' }}>
                                        ⚔️ +{characterStats.equipmentBonuses.atk} ATK
                                    </span>
                                )}
                                {characterStats.equipmentBonuses.def > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '5px' }}>
                                        🛡️ +{characterStats.equipmentBonuses.def} DEF
                                    </span>
                                )}
                                {characterStats.equipmentBonuses.crit > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '5px' }}>
                                        💥 +{characterStats.equipmentBonuses.crit}% CRIT
                                    </span>
                                )}
                                {characterStats.equipmentBonuses.xp > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '5px' }}>
                                        ⭐ +{characterStats.equipmentBonuses.xp}% XP
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

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
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: attr.color, fontFamily: 'var(--font-mono)' }}>
                                        {attr.value}
                                    </div>
                                    {attr.bonus > 0 && attr.bonusDisplay && (
                                        <span
                                            style={{
                                                fontSize: '10.5px',
                                                fontWeight: 800,
                                                color: '#10b981',
                                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                borderRadius: '5px',
                                                padding: '1px 5px',
                                                lineHeight: 1.2,
                                                fontFamily: 'var(--font-mono)',
                                                letterSpacing: '0.02em',
                                            }}
                                            title={`Termasuk bonus perlengkapan (${attr.bonusDisplay})`}
                                        >
                                            {attr.bonusDisplay}
                                        </span>
                                    )}
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
                                                                        color: '#10b981',
                                                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                                                        border: '1px solid rgba(16, 185, 129, 0.35)',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    Terpasang
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
                                                            <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        flexWrap: 'wrap',
                                                                        gap: '4px',
                                                                        padding: '3px 6px',
                                                                        borderRadius: '5px',
                                                                        backgroundColor: isEquipped ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.06)',
                                                                        border: isEquipped ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.2)',
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: isEquipped ? '#10b981' : 'var(--text-secondary)' }}>
                                                                        {isEquipped ? 'Nambah:' : 'Stat:'}
                                                                    </span>
                                                                    {formatItemStatBadges(item).map((badge) => (
                                                                        <span
                                                                            key={badge.key}
                                                                            style={{
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '2px',
                                                                                fontSize: '10px',
                                                                                fontWeight: 800,
                                                                                color: '#34d399',
                                                                                fontFamily: 'var(--font-mono)',
                                                                            }}
                                                                        >
                                                                            <span>{badge.icon}</span>
                                                                            <span style={{ color: '#10b981', fontWeight: 900 }}>{badge.display}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
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
            {mounted && typeof document !== 'undefined' && previewItem && createPortal(
                <ItemDetailModal
                    item={previewItem}
                    isOpen={Boolean(previewItem)}
                    onClose={handleClosePreview}
                    isEquipped={equipped[previewItem.slot] === previewItem.id}
                    onEquipToggle={(item, action) => handleEquipToggle(item, action)}
                    actionLoading={actionLoadingId === previewItem.id}
                    currentlyEquippedInSlot={
                        equipped[previewItem.slot]
                            ? GAME_ITEMS.find((it) => it.id === equipped[previewItem.slot]) || null
                            : null
                    }
                    playerRole={avatarClass}
                    userXp={profile?.xp || 0}
                    isInInventory={inventory.some((it) => it.id === previewItem.id)}
                />,
                document.body
            )}

            {/* SLOT QUICK SWITCHER MODAL */}
            {mounted && typeof document !== 'undefined' && activePickerSlot && createPortal(
                <SlotPickerModal
                    slot={activePickerSlot}
                    isOpen={Boolean(activePickerSlot)}
                    onClose={() => setActivePickerSlot(null)}
                    equippedItemId={equipped[activePickerSlot] || null}
                    inventory={inventory}
                    playerRole={avatarClass}
                    actionLoadingId={actionLoadingId}
                    onEquipToggle={handleEquipToggle}
                    onOpenItemDetail={(item) => handleOpenPreview(item)}
                />,
                document.body
            )}
        </div>
    )
}
