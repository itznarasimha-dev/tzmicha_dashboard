import { prisma } from '../config/prisma';

export async function getAllSettings() {
  const rows = await prisma.setting.findMany();
  return rows.reduce((acc: any, r) => { acc[r.key] = r.value; return acc; }, {});
}

export async function getSetting(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function upsertSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function upsertManySettings(settings: Record<string, string>) {
  const ops = Object.entries(settings).map(([key, value]) =>
    prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
  );
  return Promise.all(ops);
}
