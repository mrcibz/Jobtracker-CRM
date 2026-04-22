-- 1. Activar RLS (Despertar al portero) en ambas tablas
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 2. Crear Política para la tabla 'boards'
-- Permite a cualquier visitante (anon) Seleccionar, Insertar, Actualizar o Borrar
CREATE POLICY "Permitir todo a anon en boards" 
ON boards 
FOR ALL 
TO anon 
USING (true)
WITH CHECK (true);

-- 3. Crear Política para la tabla 'jobs'
-- Permite a cualquier visitante (anon) Seleccionar, Insertar, Actualizar o Borrar
CREATE POLICY "Permitir todo a anon en jobs" 
ON jobs 
FOR ALL 
TO anon 
USING (true)
WITH CHECK (true);