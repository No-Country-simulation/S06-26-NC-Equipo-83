# 1. Descarga e instalación

- Ir a https://www.postgresql.org/download/windows/
- Bajá el instalador de la versión 18
- Ejecutalo como administrador (click derecho → Ejecutar como administrador)
- En la pantalla de componentes, seleccioná solo:
- ✅ PostgreSQL Server
- ✅ Command Line Tools
- ❌ pgAdmin 4 (opcional, no necesario)
- ❌ Stack Builder (no necesario, puede causar errores)
- Región: dejá la default
- Si el paso post-instalación tira error de inicialización del cluster (como pasó acá), ignoralo. Los binarios se copiaron igual.

# 2. Verificar que los binarios existen

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
psql (PostgreSQL) 18.4

# 3. Verificar si el cluster de datos existe

Test-Path "C:\Program Files\PostgreSQL\18\data"
Si devuelve True pero pg_ctl start falla con "no es un directorio de base de datos", el initdb del instalador falló a la mitad. Solución: inicializarlo manualmente.

# 4. Inicializar el cluster manualmente
& "C:\Program Files\PostgreSQL\18\bin\initdb.exe" -D "C:\Program Files\PostgreSQL\18\data" -U postgres --encoding=UTF8 --no-locale
- -D: directorio de datos
- -U postgres: nombre del superusuario
- --encoding=UTF8: encoding UTF-8
- --no-locale: evita problemas con el locale de Windows

# 5. Arrancar el servidor

& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" -l logfile start
Si dice "servidor iniciado", PostgreSQL está corriendo.

# 6. Crear usuario y base de datos del proyecto

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE USER appbit_user WITH PASSWORD 'appbit_password';"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE appbit_database OWNER appbit_user;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE appbit_database TO appbit_user;"

# 7. Verificar conexión

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U appbit_user -d appbit_database -c "SELECT 1;"
debe devolver: 1

# 8. Crear tablas del proyecto

Desde la carpeta backend con el venv activado:
cd "E:\PROGRAMACION\PROYECTOS\App bit\backend"
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "from app.db.session import create_db_and_tables; create_db_and_tables(); print('Tablas creadas')"

# 9. Verificar tablas

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U appbit_user -d appbit_database -c "\dt"
debe mostrar: users, mental_health_logs
