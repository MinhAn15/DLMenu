-- Generate next order number for a shop (daily reset)
CREATE OR REPLACE FUNCTION public.generate_order_number(p_shop_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  today_count INT;
  today_str VARCHAR(8);
BEGIN
  today_str := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD');

  SELECT COUNT(*) + 1 INTO today_count
  FROM public.orders
  WHERE shop_id = p_shop_id
    AND created_at::date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;

  RETURN '#' || LPAD(today_count::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Calculate points for an order based on shop config
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_shop_id UUID,
  p_amount DECIMAL
)
RETURNS INT AS $$
DECLARE
  config JSONB;
  formula JSONB;
  points INT;
BEGIN
  SELECT loyalty_config INTO config FROM public.shops WHERE id = p_shop_id;
  formula := config->'points_formula';

  IF formula->>'type' = 'per_amount' THEN
    points := FLOOR(p_amount / (formula->>'amount_per_point')::DECIMAL);
  ELSIF formula->>'type' = 'percentage' THEN
    points := FLOOR(p_amount * (formula->>'percentage')::DECIMAL / 100);
  ELSIF formula->>'type' = 'per_order' THEN
    points := 1;
  ELSE
    points := 0;
  END IF;

  RETURN GREATEST(points, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Determine rank based on points and shop config
CREATE OR REPLACE FUNCTION public.determine_rank(
  p_shop_id UUID,
  p_ranking_points INT
)
RETURNS VARCHAR(20) AS $$
DECLARE
  config JSONB;
  ranks JSONB;
  rank_item JSONB;
  result_rank VARCHAR(20) := 'member';
BEGIN
  SELECT loyalty_config INTO config FROM public.shops WHERE id = p_shop_id;
  ranks := config->'ranks';

  FOR rank_item IN SELECT * FROM jsonb_array_elements(ranks)
  LOOP
    IF p_ranking_points >= (rank_item->>'min_points')::INT THEN
      CASE rank_item->>'name'
        WHEN 'Thành viên' THEN result_rank := 'member';
        WHEN 'Bạc' THEN result_rank := 'silver';
        WHEN 'Vàng' THEN result_rank := 'gold';
        WHEN 'Kim cương' THEN result_rank := 'diamond';
        ELSE result_rank := 'member';
      END CASE;
    END IF;
  END LOOP;

  RETURN result_rank;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get discount for a rank at a shop
CREATE OR REPLACE FUNCTION public.get_rank_discount(
  p_shop_id UUID,
  p_rank VARCHAR(20)
)
RETURNS INT AS $$
DECLARE
  config JSONB;
  ranks JSONB;
  rank_item JSONB;
  rank_name_vi VARCHAR(20);
BEGIN
  SELECT loyalty_config INTO config FROM public.shops WHERE id = p_shop_id;
  ranks := config->'ranks';

  CASE p_rank
    WHEN 'member' THEN rank_name_vi := 'Thành viên';
    WHEN 'silver' THEN rank_name_vi := 'Bạc';
    WHEN 'gold' THEN rank_name_vi := 'Vàng';
    WHEN 'diamond' THEN rank_name_vi := 'Kim cương';
    ELSE rank_name_vi := 'Thành viên';
  END CASE;

  FOR rank_item IN SELECT * FROM jsonb_array_elements(ranks)
  LOOP
    IF rank_item->>'name' = rank_name_vi THEN
      RETURN COALESCE((rank_item->>'discount_percent')::INT, 0);
    END IF;
  END LOOP;

  RETURN 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
