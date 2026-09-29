-- ==============================================================================
-- 005_character_customization.sql — Character Roles & Equipment Customization
-- ==============================================================================

-- 1. Tambah field equipped_items dan character_created di profiles jika belum ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS equipped_items JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS character_created BOOLEAN DEFAULT FALSE;

-- 2. Buat tabel user_inventory untuk melacak item yang dimiliki dan status equip
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('weapon', 'head', 'armor', 'accessory')),
  is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Indexing untuk kecepatan query inventori user
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON public.user_inventory(user_id, is_equipped);

-- 3. Row Level Security (RLS)
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_inventory_self_read" ON public.user_inventory;
CREATE POLICY "user_inventory_self_read" 
ON public.user_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_inventory_self_insert" ON public.user_inventory;
CREATE POLICY "user_inventory_self_insert" 
ON public.user_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_inventory_self_update" ON public.user_inventory;
CREATE POLICY "user_inventory_self_update" 
ON public.user_inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_inventory_self_delete" ON public.user_inventory;
CREATE POLICY "user_inventory_self_delete" 
ON public.user_inventory 
FOR DELETE 
USING (auth.uid() = user_id);
