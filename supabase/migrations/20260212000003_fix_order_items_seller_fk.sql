-- Add foreign key from order_items.seller_id to profiles.id
-- so PostgREST can resolve the join between order_items and profiles

ALTER TABLE order_items
  ADD CONSTRAINT order_items_seller_id_profiles_fkey
  FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
