CREATE TYPE public.app_role AS ENUM ('farmer', 'consumer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  farm_name TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own role" ON public.user_roles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.produce_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Vegetables',
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  location TEXT,
  harvest_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.produce_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produce_listings TO authenticated;
GRANT ALL ON public.produce_listings TO service_role;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active produce" ON public.produce_listings FOR SELECT TO anon, authenticated USING (status = 'active' OR auth.uid() = farmer_id);
CREATE POLICY "Farmers can create produce" ON public.produce_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));
CREATE POLICY "Farmers can update own produce" ON public.produce_listings FOR UPDATE TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own produce" ON public.produce_listings FOR DELETE TO authenticated USING (auth.uid() = farmer_id);
CREATE INDEX produce_listings_category_idx ON public.produce_listings(category);
CREATE INDEX produce_listings_status_idx ON public.produce_listings(status);
CREATE INDEX produce_listings_farmer_idx ON public.produce_listings(farmer_id);

CREATE TABLE public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.purchase_requests TO authenticated;
GRANT ALL ON public.purchase_requests TO service_role;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Consumers can create purchase requests" ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = consumer_id AND public.has_role(auth.uid(), 'consumer'));
CREATE POLICY "Users can view related purchase requests" ON public.purchase_requests FOR SELECT TO authenticated USING (auth.uid() = consumer_id OR auth.uid() = farmer_id);
CREATE POLICY "Consumers can cancel own requests" ON public.purchase_requests FOR UPDATE TO authenticated USING (auth.uid() = consumer_id) WITH CHECK (auth.uid() = consumer_id);
CREATE POLICY "Farmers can update incoming requests" ON public.purchase_requests FOR UPDATE TO authenticated USING (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer')) WITH CHECK (auth.uid() = farmer_id);
CREATE INDEX purchase_requests_consumer_idx ON public.purchase_requests(consumer_id);
CREATE INDEX purchase_requests_farmer_idx ON public.purchase_requests(farmer_id);
CREATE INDEX purchase_requests_listing_idx ON public.purchase_requests(listing_id);