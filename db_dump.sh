echo "Dump Database"
pg_dump --host=localhost --port=5432 --username=dbadmin --dbname=garp --file=database_dumps/garp.sql -v -Fc