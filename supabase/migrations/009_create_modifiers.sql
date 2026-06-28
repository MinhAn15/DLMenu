-- ==========================================
-- Migration 009: Modifier Groups & Modifiers
-- ==========================================

-- 1. Create modifier_groups table
CREATE TABLE public.modifier_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    max_selections INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create modifiers table
CREATE TABLE public.modifiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_delta INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create item_modifier_groups table (Mapping)
CREATE TABLE public.item_modifier_groups (
    item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (item_id, group_id)
);

-- ==========================================
-- RLS Policies
-- ==========================================

ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_modifier_groups ENABLE ROW LEVEL SECURITY;

-- modifier_groups policies
CREATE POLICY "modifier_groups are viewable by everyone" ON public.modifier_groups
    FOR SELECT USING (true);

CREATE POLICY "Shop owners can manage their modifier_groups" ON public.modifier_groups
    FOR ALL
    USING (
        auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id)
    );

-- modifiers policies
CREATE POLICY "modifiers are viewable by everyone" ON public.modifiers
    FOR SELECT USING (true);

CREATE POLICY "Shop owners can manage their modifiers" ON public.modifiers
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT s.owner_id 
            FROM public.shops s 
            JOIN public.modifier_groups mg ON mg.shop_id = s.id 
            WHERE mg.id = group_id
        )
    );

-- item_modifier_groups policies
CREATE POLICY "item_modifier_groups are viewable by everyone" ON public.item_modifier_groups
    FOR SELECT USING (true);

CREATE POLICY "Shop owners can manage their item_modifier_groups" ON public.item_modifier_groups
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT s.owner_id 
            FROM public.shops s 
            JOIN public.menu_items mi ON mi.shop_id = s.id 
            WHERE mi.id = item_id
        )
    );
