-- Thêm cột cấu hình vào bảng shops
ALTER TABLE shops 
ADD COLUMN max_order_value DECIMAL(12,2) DEFAULT 2000000 NOT NULL,
ADD COLUMN max_cart_items INTEGER DEFAULT 20 NOT NULL;

-- Function kiểm tra giới hạn đơn hàng
CREATE OR REPLACE FUNCTION check_order_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_max_value DECIMAL;
  v_max_items INTEGER;
  v_current_total DECIMAL := 0;
  v_current_items INTEGER := 0;
BEGIN
  -- Lấy cấu hình của quán
  SELECT max_order_value, max_cart_items INTO v_max_value, v_max_items
  FROM shops
  WHERE id = NEW.shop_id;

  -- Kiểm tra giá trị tổng hóa đơn
  IF NEW.subtotal > v_max_value THEN
    RAISE EXCEPTION 'Order subtotal exceeds the shop maximum allowed value of %', v_max_value;
  END IF;

  -- Rate limit cơ bản: Kiểm tra xem user_id (nếu có) có tạo quá nhiều đơn trong 5 phút không
  IF NEW.user_id IS NOT NULL THEN
    IF (
      SELECT count(*) 
      FROM orders 
      WHERE user_id = NEW.user_id 
      AND created_at > NOW() - INTERVAL '5 minutes'
    ) > 3 THEN
      RAISE EXCEPTION 'Rate limit exceeded: Too many orders placed recently.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger chạy trước khi INSERT đơn hàng
CREATE TRIGGER trigger_check_order_limits
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION check_order_limits();
