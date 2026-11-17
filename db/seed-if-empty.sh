#!/bin/sh
# ใช้กับ service `seed` ใน compose.yaml
# รอให้ backend สร้างตารางครบ แล้วใส่ข้อมูลหลักสูตรจาก seed.sql เฉพาะตอนที่ยังไม่มีวิชาเลย
# (มีข้อมูลอยู่แล้ว = ข้าม ไม่ทับของเดิม)
set -e

SEED_TABLES="'courses','topics','relation_topic_course','prerequisites','topic_relations','resources','relation_res_topics'"
SEED_TABLE_COUNT=7

run_sql() {
  mysql -h mysql -uroot --default-character-set=utf8mb4 -N "$MYSQL_DATABASE" "$@"
}

echo "seed: waiting for the backend to create the tables..."
until [ "$(run_sql -e "SELECT COUNT(*) FROM information_schema.tables
                       WHERE table_schema = DATABASE() AND table_name IN ($SEED_TABLES)" 2>/dev/null)" = "$SEED_TABLE_COUNT" ]; do
  sleep 2
done

if [ "$(run_sql -e "SELECT COUNT(*) FROM courses")" != "0" ]; then
  echo "seed: courses already exist, skipped"
  exit 0
fi

run_sql < /db/seed.sql
echo "seed: loaded $(run_sql -e "SELECT COUNT(*) FROM courses") courses"
