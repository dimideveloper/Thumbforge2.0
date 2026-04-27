
-- Add is_admin to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update support_tickets RLS to allow admins
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users and admins can view tickets" ON public.support_tickets 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own tickets status" ON public.support_tickets;
CREATE POLICY "Users and admins can update tickets" ON public.support_tickets 
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid())
  );

-- Update support_messages RLS to allow admins
DROP POLICY IF EXISTS "Users can view messages for their own tickets" ON public.support_messages;
CREATE POLICY "Users and admins can view messages" ON public.support_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = support_messages.ticket_id AND (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to their own tickets" ON public.support_messages;
CREATE POLICY "Users and admins can insert messages" ON public.support_messages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = support_messages.ticket_id AND (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()))
    )
  );
