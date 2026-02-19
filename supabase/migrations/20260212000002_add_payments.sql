-- ============================================
-- Table: seller_payment_info
-- ============================================
-- Stores seller bank/payment information

CREATE TABLE seller_payment_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bank_name VARCHAR(255),
  account_holder_name VARCHAR(255),
  account_number_last4 VARCHAR(4),
  routing_number_last4 VARCHAR(4),
  paypal_email VARCHAR(255),
  stripe_account_id VARCHAR(255),
  payment_method_preference VARCHAR(20) DEFAULT 'stripe' CHECK (payment_method_preference IN ('stripe', 'paypal', 'bank_transfer')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seller_payment_info ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sellers can view their own payment info" ON seller_payment_info
  FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert their own payment info" ON seller_payment_info
  FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own payment info" ON seller_payment_info
  FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can view seller payment method preference" ON seller_payment_info
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seller_payment_info_seller_id ON seller_payment_info(seller_id);

-- Triggers
CREATE TRIGGER update_seller_payment_info_updated_at
  BEFORE UPDATE ON seller_payment_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: payments
-- ============================================
-- Tracks payment transactions

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
  payment_method VARCHAR(50),
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Sellers can view payments for their orders
CREATE POLICY "Sellers can view payments for their order items" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_items.order_id = payments.order_id
      AND order_items.seller_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_buyer_id ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Triggers
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function: create_order_from_cart
-- ============================================
-- Creates an order from cart items and clears the cart

CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_buyer_id UUID,
  p_shipping_address JSONB DEFAULT NULL,
  p_payment_method VARCHAR DEFAULT 'stripe',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_total DECIMAL(10,2);
  v_cart_item RECORD;
BEGIN
  -- Calculate total from active cart items
  SELECT COALESCE(SUM(ci.quantity * p.price), 0)
  INTO v_total
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.user_id = p_buyer_id
  AND p.is_active = true;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Cart is empty or contains no active products';
  END IF;

  -- Create order
  INSERT INTO orders (buyer_id, total_amount, status, shipping_address, payment_method, notes)
  VALUES (p_buyer_id, v_total, 'pending', p_shipping_address, p_payment_method, p_notes)
  RETURNING id INTO v_order_id;

  -- Create order items from cart
  INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price, total_price)
  SELECT
    v_order_id,
    ci.product_id,
    p.seller_id,
    ci.quantity,
    p.price,
    ci.quantity * p.price
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.user_id = p_buyer_id
  AND p.is_active = true;

  -- Update product stock quantities
  FOR v_cart_item IN
    SELECT ci.product_id, ci.quantity
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = p_buyer_id
    AND p.is_active = true
  LOOP
    UPDATE products
    SET stock_quantity = GREATEST(stock_quantity - v_cart_item.quantity, 0)
    WHERE id = v_cart_item.product_id;
  END LOOP;

  -- Clear user's cart
  DELETE FROM cart_items WHERE user_id = p_buyer_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_order_from_cart(UUID, JSONB, VARCHAR, TEXT) TO authenticated;
