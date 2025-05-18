/*
  # Seed initial data
  
  1. Initial Data
    - Categories for PC components
    - Sample products for each category
    
  2. Structure
    - Categories with descriptions and images
    - Products with detailed specifications
    - All products linked to appropriate categories
*/

-- Create categories first
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  specifications JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

-- Insert categories
INSERT INTO categories (name, description, image_url)
VALUES
  ('Processors', 'Central Processing Units (CPUs) - the brain of your computer', 'https://images.pexels.com/photos/2588757/pexels-photo-2588757.jpeg'),
  ('Motherboards', 'The main circuit board that connects all your components', 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg'),
  ('Graphics Cards', 'GPUs for gaming, rendering, and graphics processing', 'https://images.pexels.com/photos/5412270/pexels-photo-5412270.jpeg'),
  ('Memory', 'RAM modules for system memory', 'https://images.pexels.com/photos/4597125/pexels-photo-4597125.jpeg'),
  ('Storage', 'SSDs and HDDs for data storage', 'https://images.pexels.com/photos/3293148/pexels-photo-3293148.jpeg'),
  ('Power Supplies', 'PSUs to power your system', 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg'),
  ('Cases', 'PC cases and chassis', 'https://images.pexels.com/photos/5017066/pexels-photo-5017066.jpeg'),
  ('Cooling', 'CPU coolers, fans, and liquid cooling solutions', 'https://images.pexels.com/photos/7809123/pexels-photo-7809123.jpeg')
ON CONFLICT (id) DO NOTHING;

-- Get the category IDs
DO $$
DECLARE
  cpu_id UUID;
  mobo_id UUID;
  gpu_id UUID;
  ram_id UUID;
  storage_id UUID;
  psu_id UUID;
  case_id UUID;
  cooling_id UUID;
BEGIN
  SELECT id INTO cpu_id FROM categories WHERE name = 'Processors' LIMIT 1;
  SELECT id INTO mobo_id FROM categories WHERE name = 'Motherboards' LIMIT 1;
  SELECT id INTO gpu_id FROM categories WHERE name = 'Graphics Cards' LIMIT 1;
  SELECT id INTO ram_id FROM categories WHERE name = 'Memory' LIMIT 1;
  SELECT id INTO storage_id FROM categories WHERE name = 'Storage' LIMIT 1;
  SELECT id INTO psu_id FROM categories WHERE name = 'Power Supplies' LIMIT 1;
  SELECT id INTO case_id FROM categories WHERE name = 'Cases' LIMIT 1;
  SELECT id INTO cooling_id FROM categories WHERE name = 'Cooling' LIMIT 1;

  -- Insert products - CPUs
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('AMD Ryzen 9 5900X', 'Flagship AMD processor with 12 cores and 24 threads for extreme performance', 499.99, 'https://images.pexels.com/photos/1473008/pexels-photo-1473008.jpeg', 25, cpu_id, '{"cores": 12, "threads": 24, "base_clock": "3.7 GHz", "boost_clock": "4.8 GHz", "tdp": "105W", "socket": "AM4"}'),
    ('Intel Core i9-12900K', 'High-end Intel processor with 16 cores and 24 threads', 589.99, 'https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg', 18, cpu_id, '{"cores": 16, "threads": 24, "base_clock": "3.2 GHz", "boost_clock": "5.2 GHz", "tdp": "125W", "socket": "LGA1700"}'),
    ('AMD Ryzen 7 5800X', 'Excellent gaming performance with 8 cores and 16 threads', 349.99, 'https://images.pexels.com/photos/2582935/pexels-photo-2582935.jpeg', 32, cpu_id, '{"cores": 8, "threads": 16, "base_clock": "3.8 GHz", "boost_clock": "4.7 GHz", "tdp": "105W", "socket": "AM4"}'),
    ('Intel Core i5-12600K', 'Mid-range Intel processor with great performance', 289.99, 'https://images.pexels.com/photos/4597325/pexels-photo-4597325.jpeg', 40, cpu_id, '{"cores": 10, "threads": 16, "base_clock": "3.7 GHz", "boost_clock": "4.9 GHz", "tdp": "125W", "socket": "LGA1700"}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - Motherboards
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('ASUS ROG Strix B550-F', 'AMD AM4 socket motherboard with excellent features for gaming', 179.99, 'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg', 15, mobo_id, '{"socket": "AM4", "chipset": "B550", "memory_slots": 4, "max_memory": "128GB", "form_factor": "ATX"}'),
    ('MSI MPG Z690 Gaming Edge', 'Intel LGA1700 motherboard with Wi-Fi 6E and PCIe 5.0', 289.99, 'https://images.pexels.com/photos/3520728/pexels-photo-3520728.jpeg', 12, mobo_id, '{"socket": "LGA1700", "chipset": "Z690", "memory_slots": 4, "max_memory": "128GB", "form_factor": "ATX"}'),
    ('Gigabyte B660 Aorus Master', 'Feature-rich Intel motherboard with excellent VRMs', 259.99, 'https://images.pexels.com/photos/6769788/pexels-photo-6769788.jpeg', 8, mobo_id, '{"socket": "LGA1700", "chipset": "B660", "memory_slots": 4, "max_memory": "128GB", "form_factor": "ATX"}'),
    ('ASRock X570 Steel Legend', 'Reliable AMD motherboard with great connectivity options', 199.99, 'https://images.pexels.com/photos/3520638/pexels-photo-3520638.jpeg', 20, mobo_id, '{"socket": "AM4", "chipset": "X570", "memory_slots": 4, "max_memory": "128GB", "form_factor": "ATX"}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - GPUs
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('NVIDIA GeForce RTX 4080', 'High-end graphics card for 4K gaming and content creation', 1199.99, 'https://images.pexels.com/photos/5499303/pexels-photo-5499303.jpeg', 8, gpu_id, '{"memory": "16GB GDDR6X", "cuda_cores": 9728, "boost_clock": "2.51 GHz", "tdp": "320W", "interface": "PCIe 4.0"}'),
    ('AMD Radeon RX 7900 XT', 'Powerful AMD GPU with ray tracing capabilities', 999.99, 'https://images.pexels.com/photos/2588757/pexels-photo-2588757.jpeg', 10, gpu_id, '{"memory": "20GB GDDR6", "stream_processors": 10752, "game_clock": "2.3 GHz", "tdp": "300W", "interface": "PCIe 4.0"}'),
    ('NVIDIA GeForce RTX 4060 Ti', 'Mid-range graphics card with excellent 1440p performance', 499.99, 'https://images.pexels.com/photos/5017065/pexels-photo-5017065.jpeg', 15, gpu_id, '{"memory": "8GB GDDR6", "cuda_cores": 4352, "boost_clock": "2.54 GHz", "tdp": "160W", "interface": "PCIe 4.0"}'),
    ('AMD Radeon RX 6800 XT', 'Great value gaming GPU with high performance', 699.99, 'https://images.pexels.com/photos/4224099/pexels-photo-4224099.jpeg', 12, gpu_id, '{"memory": "16GB GDDR6", "stream_processors": 4608, "game_clock": "2.1 GHz", "tdp": "300W", "interface": "PCIe 4.0"}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - RAM
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('Corsair Vengeance RGB Pro 32GB', 'High-performance DDR4 memory with RGB lighting', 149.99, 'https://images.pexels.com/photos/4597125/pexels-photo-4597125.jpeg', 30, ram_id, '{"capacity": "32GB (2x16GB)", "type": "DDR4", "speed": "3600MHz", "cas_latency": "18", "voltage": "1.35V"}'),
    ('G.Skill Trident Z5 RGB 32GB', 'Premium DDR5 memory for latest-gen systems', 219.99, 'https://images.pexels.com/photos/5499263/pexels-photo-5499263.jpeg', 20, ram_id, '{"capacity": "32GB (2x16GB)", "type": "DDR5", "speed": "6000MHz", "cas_latency": "36", "voltage": "1.35V"}'),
    ('Kingston FURY Beast 16GB', 'Reliable DDR4 memory for gaming PCs', 79.99, 'https://images.pexels.com/photos/4597108/pexels-photo-4597108.jpeg', 35, ram_id, '{"capacity": "16GB (2x8GB)", "type": "DDR4", "speed": "3200MHz", "cas_latency": "16", "voltage": "1.35V"}'),
    ('Crucial Ballistix MAX 64GB', 'High-capacity memory for workstations and power users', 329.99, 'https://images.pexels.com/photos/3520694/pexels-photo-3520694.jpeg', 15, ram_id, '{"capacity": "64GB (4x16GB)", "type": "DDR4", "speed": "4000MHz", "cas_latency": "18", "voltage": "1.35V"}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - Storage
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('Samsung 980 PRO 1TB', 'High-performance PCIe 4.0 NVMe SSD', 199.99, 'https://images.pexels.com/photos/3293148/pexels-photo-3293148.jpeg', 25, storage_id, '{"capacity": "1TB", "interface": "PCIe 4.0 x4", "sequential_read": "7000 MB/s", "sequential_write": "5000 MB/s", "form_factor": "M.2 2280"}'),
    ('Western Digital Black SN850 2TB', 'Fast NVMe SSD for gaming and content creation', 299.99, 'https://images.pexels.com/photos/3345882/pexels-photo-3345882.jpeg', 18, storage_id, '{"capacity": "2TB", "interface": "PCIe 4.0 x4", "sequential_read": "7000 MB/s", "sequential_write": "5300 MB/s", "form_factor": "M.2 2280"}'),
    ('Crucial MX500 2TB', 'Reliable SATA SSD for mass storage', 169.99, 'https://images.pexels.com/photos/3829849/pexels-photo-3829849.jpeg', 30, storage_id, '{"capacity": "2TB", "interface": "SATA III", "sequential_read": "560 MB/s", "sequential_write": "510 MB/s", "form_factor": "2.5-inch"}'),
    ('Seagate Barracuda 4TB', 'High-capacity HDD for archival storage', 89.99, 'https://images.pexels.com/photos/5925/technology-white-black-business.jpg', 40, storage_id, '{"capacity": "4TB", "interface": "SATA III", "rpm": "5400", "cache": "256MB", "form_factor": "3.5-inch"}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - PSUs
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('Corsair RM850x', '850W Gold certified fully modular power supply', 149.99, 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg', 20, psu_id, '{"wattage": "850W", "efficiency": "80+ Gold", "modular": "Fully", "fan_size": "135mm", "warranty": "10 years"}'),
    ('EVGA SuperNOVA 1000 G6', 'High-wattage PSU for demanding systems', 189.99, 'https://images.pexels.com/photos/577514/pexels-photo-577514.jpeg', 15, psu_id, '{"wattage": "1000W", "efficiency": "80+ Gold", "modular": "Fully", "fan_size": "135mm", "warranty": "10 years"}'),
    ('be quiet! Straight Power 11 750W', 'Premium PSU with silent operation', 139.99, 'https://images.pexels.com/photos/3520726/pexels-photo-3520726.jpeg', 12, psu_id, '{"wattage": "750W", "efficiency": "80+ Gold", "modular": "Fully", "fan_size": "135mm", "warranty": "5 years"}'),
    ('Seasonic FOCUS GX-650', 'Reliable and efficient mid-range power supply', 109.99, 'https://images.pexels.com/photos/1476318/pexels-photo-1476318.jpeg', 25, psu_id, '{"wattage": "650W", "efficiency": "80+ Gold", "modular": "Fully", "fan_size": "120mm", "warranty": "10 years"}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - Cases
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('Fractal Design Meshify 2', 'High-airflow ATX mid-tower case with excellent build quality', 149.99, 'https://images.pexels.com/photos/5017066/pexels-photo-5017066.jpeg', 15, case_id, '{"form_factor": "Mid Tower", "motherboard_support": "ATX, Micro-ATX, Mini-ITX", "drive_bays": "6x 3.5\", 2x 2.5\"", "front_io": "USB-C, 2x USB-A", "included_fans": 3}'),
    ('NZXT H510 Flow', 'Compact mid-tower with excellent airflow', 99.99, 'https://images.pexels.com/photos/6477403/pexels-photo-6477403.jpeg', 22, case_id, '{"form_factor": "Mid Tower", "motherboard_support": "ATX, Micro-ATX, Mini-ITX", "drive_bays": "3x 3.5\", 2x 2.5\"", "front_io": "USB-C, USB-A", "included_fans": 2}'),
    ('Lian Li O11 Dynamic EVO', 'Premium dual-chamber case with stunning aesthetics', 189.99, 'https://images.pexels.com/photos/7824016/pexels-photo-7824016.jpeg', 10, case_id, '{"form_factor": "Mid Tower", "motherboard_support": "ATX, Micro-ATX, Mini-ITX", "drive_bays": "4x 3.5\", 2x 2.5\"", "front_io": "USB-C, 2x USB-A", "included_fans": 0}'),
    ('Corsair 4000D Airflow', 'Affordable mid-tower with excellent cooling potential', 94.99, 'https://images.pexels.com/photos/5412270/pexels-photo-5412270.jpeg', 18, case_id, '{"form_factor": "Mid Tower", "motherboard_support": "ATX, Micro-ATX, Mini-ITX", "drive_bays": "2x 3.5\", 2x 2.5\"", "front_io": "USB-C, USB-A", "included_fans": 2}')
  ON CONFLICT (id) DO NOTHING;

  -- Insert products - Cooling
  INSERT INTO products (name, description, price, image_url, stock, category_id, specifications)
  VALUES
    ('Noctua NH-D15', 'Premium dual-tower air cooler for CPUs', 99.99, 'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg', 20, cooling_id, '{"type": "Air", "fans": "2x 140mm", "height": "165mm", "tdp": "220W", "rgb": false}'),
    ('ARCTIC Liquid Freezer II 360', 'High-performance 360mm all-in-one liquid cooler', 139.99, 'https://images.pexels.com/photos/7809123/pexels-photo-7809123.jpeg', 15, cooling_id, '{"type": "AIO Liquid", "radiator": "360mm", "fans": "3x 120mm", "rgb": false}'),
    ('Corsair iCUE H150i Elite Capellix', 'Premium RGB liquid cooler with excellent performance', 189.99, 'https://images.pexels.com/photos/6994978/pexels-photo-6994978.jpeg', 12, cooling_id, '{"type": "AIO Liquid", "radiator": "360mm", "fans": "3x 120mm", "rgb": true}'),
    ('be quiet! Dark Rock Pro 4', 'Silent high-performance air cooler', 89.99, 'https://images.pexels.com/photos/7056453/pexels-photo-7056453.jpeg', 18, cooling_id, '{"type": "Air", "fans": "1x 135mm, 1x 120mm", "height": "162.8mm", "tdp": "250W", "rgb": false}')
  ON CONFLICT (id) DO NOTHING;

  -- Добавьте в ваш SQL файл
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.users (id, email, is_admin)
    VALUES (NEW.id, NEW.email, false);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

    -- Разрешить пользователям читать только свои данные
  CREATE POLICY "Enable read access for own user" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

  -- Разрешить пользователям обновлять свои данные
  CREATE POLICY "Enable update for own user"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
END $$;