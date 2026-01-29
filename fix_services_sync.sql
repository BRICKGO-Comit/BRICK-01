-- ACTIVEZ LA SYNCHRONISATION DES SERVICES
-- Exécutez ce script dans Supabase pour que les nouveaux services apparaissent dans l'app.

-- 1. Activer le Realtime pour la table services
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'services') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE services;
  END IF;
END $$;

-- 2. Autoriser la lecture publique des services (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Services" ON services;
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);

-- 3. Forcer les services à être "actifs" par défaut (éviter qu'ils soient cachés)
UPDATE services SET is_active = true WHERE is_active IS NULL;
ALTER TABLE services ALTER COLUMN is_active SET DEFAULT true;

-- 4. Vérifier les permissions
GRANT SELECT ON services TO anon, authenticated;
