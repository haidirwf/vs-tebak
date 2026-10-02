'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ShopClient, { ShopTab } from './ShopClient'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, VoucherItem, RedemptionItem } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'
import { GAME_ITEMS, GameItem, getStarterItemsForClass } from '@/lib/game/items'
import { EquippedItemsMap, getStarterEquippedMap } from '@/lib/game/character'
import { AvatarClass } from '@/types'

function ShopSkeleton() {
    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="sq-skeleton" style={{ height: '36px', width: '220px', marginBottom: '16px' }} />
            <div className="sq-skeleton" style={{ height: '70px', width: '100%', marginBottom: '24px', borderRadius: '14px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card" style={{ padding: '20px', height: '240px', borderRadius: '14px' }}>
                        <div className="sq-skeleton" style={{ height: '20px', width: '80%', marginBottom: '12px' }} />
                        <div className="sq-skeleton" style={{ height: '14px', width: '60%', marginBottom: '16px' }} />
                        <div className="sq-skeleton" style={{ height: '40px', width: '100%' }} />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ShopPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as ShopTab | null

    const { profile } = useUserStore()
    const {
        vouchers,
        voucherHistory,
        vouchersFetchedAt,
        setVoucherData,
        characterInventory,
        characterEquipped,
        characterInventoryFetchedAt,
        setCharacterInventoryData,
    } = useContentStore()

    const [isLoading, setIsLoading] = useState(!vouchersFetchedAt && !characterInventoryFetchedAt)

    const avatarClass = (profile?.avatar_class as AvatarClass) || 'warrior'

    // Determine initial inventory & equipped map
    const initialInventory = useMemo(() => {
        if (characterInventory && characterInventory.length > 0) {
            return characterInventory
        }
        return getStarterItemsForClass(avatarClass)
    }, [characterInventory, avatarClass])

    const initialEquipped = useMemo(() => {
        if (profile?.equipped_items && Object.keys(profile.equipped_items).length > 0) {
            return profile.equipped_items as EquippedItemsMap
        }
        if (characterEquipped && Object.keys(characterEquipped).length > 0) {
            return characterEquipped
        }
        return getStarterEquippedMap(avatarClass)
    }, [profile?.equipped_items, characterEquipped, avatarClass])

    useEffect(() => {
        const supabase = createClient()

        async function fetchShopData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            try {
                const [vouchersRes, historyRes, invRes] = await Promise.all([
                    supabase
                        .from('voucher_catalog')
                        .select('*')
                        .eq('is_active', true)
                        .order('xp_cost', { ascending: true }),
                    supabase
                        .from('voucher_redemptions')
                        .select('id, voucher_id, code, xp_spent, voucher_value, status, created_at, voucher_catalog(name)')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20),
                    supabase
                        .from('user_inventory')
                        .select('item_id, slot, is_equipped')
                        .eq('user_id', user.id),
                ])

                // Process vouchers
                const formattedHistory: RedemptionItem[] = ((historyRes.data || []) as any[]).map((row) => {
                    const relation = row.voucher_catalog
                    const voucherName = Array.isArray(relation) ? relation[0]?.name : relation?.name
                    return {
                        ...row,
                        voucherName: voucherName || 'Voucher Kantin',
                    }
                })

                setVoucherData({
                    vouchers: (vouchersRes.data || []) as VoucherItem[],
                    history: formattedHistory,
                })

                // Process inventory
                const inventoryRows = invRes.data || []
                let finalInventory: GameItem[] = []
                let finalEquipped: EquippedItemsMap = initialEquipped

                if (inventoryRows.length > 0) {
                    const ownedItemIds = new Set(inventoryRows.map((r: any) => r.item_id))
                    const serverInventory = GAME_ITEMS.filter((it) => ownedItemIds.has(it.id))
                    finalInventory = serverInventory.length > 0 ? serverInventory : getStarterItemsForClass(avatarClass)

                    const equippedFromRows: EquippedItemsMap = {}
                    inventoryRows.forEach((row: any) => {
                        if (row.is_equipped && row.slot) {
                            equippedFromRows[row.slot as keyof EquippedItemsMap] = row.item_id
                        }
                    })

                    if (Object.keys(equippedFromRows).length > 0) {
                        finalEquipped = equippedFromRows
                    }
                } else {
                    finalInventory = getStarterItemsForClass(avatarClass)
                }

                setCharacterInventoryData({
                    equipped: finalEquipped,
                    inventory: finalInventory,
                })
            } catch (err) {
                console.error('Error loading shop data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        const isVoucherStale = !vouchersFetchedAt || Date.now() - vouchersFetchedAt > 60_000
        const isInvStale = !characterInventoryFetchedAt || Date.now() - characterInventoryFetchedAt > 60_000

        if (isVoucherStale || isInvStale) {
            fetchShopData()
        } else {
            setIsLoading(false)
        }
    }, [
        vouchersFetchedAt,
        characterInventoryFetchedAt,
        setVoucherData,
        setCharacterInventoryData,
        avatarClass,
        initialEquipped,
    ])

    if (isLoading && vouchers.length === 0 && (!characterInventory || characterInventory.length === 0)) {
        return <ShopSkeleton />
    }

    return (
        <ShopClient
            initialTab={tabParam === 'items' ? 'items' : 'voucher'}
            initialXp={profile?.xp ?? 0}
            vouchers={vouchers}
            initialHistory={voucherHistory}
            initialInventory={initialInventory}
        />
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<ShopSkeleton />}>
            <ShopPageContent />
        </Suspense>
    )
}
