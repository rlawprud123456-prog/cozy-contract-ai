-- 1. 채팅방 테이블
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  contract_id uuid REFERENCES public.contracts(id),
  customer_id uuid,
  partner_id uuid
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM partners WHERE id = chat_rooms.partner_id));

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 2. 채팅 메시지 테이블
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_messages.room_id AND (customer_id = auth.uid() OR partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))));

CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3. 공정 단계 테이블
CREATE TABLE public.contract_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  status text NOT NULL DEFAULT 'locked',
  amount bigint,
  evidence_photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

ALTER TABLE public.contract_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contract stages" ON public.contract_stages
  FOR SELECT USING (EXISTS (SELECT 1 FROM contracts WHERE id = contract_stages.contract_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their contract stages" ON public.contract_stages
  FOR UPDATE USING (EXISTS (SELECT 1 FROM contracts WHERE id = contract_stages.contract_id AND user_id = auth.uid()));

CREATE POLICY "Admins can manage all stages" ON public.contract_stages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. 아이디어북 테이블
CREATE TABLE public.idea_books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  note text,
  image_url text NOT NULL,
  is_contract_attached boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own idea books" ON public.idea_books
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. partners 테이블에 완공/분쟁 카운트 추가
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS completed_count integer DEFAULT 0;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS dispute_count integer DEFAULT 0;