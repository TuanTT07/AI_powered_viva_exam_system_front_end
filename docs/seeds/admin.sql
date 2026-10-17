-- Run in Supabase SQL Editor after applying the AIVES backend migrations.
-- This seeds public.users, not Supabase Auth (auth.users).
-- New account: admin@academia.edu.vn / AivesDemo!2026
-- Existing accounts keep their password. Rotate this demo password before production.
BEGIN;

INSERT INTO public.roles (role_name, description)
VALUES ('ADMIN', 'Quản trị hệ thống')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO public.users (role_id, user_code, full_name, email, password_hash)
SELECT id,
       'ADMIN-AIVES-001',
       'Quản trị viên AIVES',
       'admin@academia.edu.vn',
       '$2a$10$jXglFDFWm/BPyeCIkCk/qeEhmNAOPcMyBJ3ae8/zz3Xiufv31qVDW'
FROM public.roles
WHERE role_name = 'ADMIN'
ON CONFLICT (email) DO NOTHING;

-- Fail instead of silently treating an existing non-admin account as an admin.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.email = 'admin@academia.edu.vn' AND r.role_name = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Email already belongs to a non-admin account; no changes were saved.';
  END IF;
END;
$$;

COMMIT;

SELECT u.id, u.email, u.user_code, u.full_name, r.role_name
FROM public.users u
JOIN public.roles r ON r.id = u.role_id
WHERE u.email = 'admin@academia.edu.vn';
