import { Room } from './types';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_PREFIX = "room:";

export async function getRoomFromRedis(code: string): Promise<Room | undefined> {
  if (!code) return undefined;
  const room = await redis.get<Room>(ROOM_PREFIX + code.toUpperCase());
  return room || undefined;
}

export async function saveRoomToRedis(code: string, room: Room): Promise<void> {
  if (!code || !room) return;
  // Expire rooms after 24 hours to keep Redis clean (86400 seconds)
  await redis.set(ROOM_PREFIX + code.toUpperCase(), room, { ex: 86400 });
}

export async function deleteRoomFromRedis(code: string): Promise<void> {
  if (!code) return;
  await redis.del(ROOM_PREFIX + code.toUpperCase());
}

export async function getAllRooms(): Promise<[string, Room][]> {
  const keys = await redis.keys(ROOM_PREFIX + "*");
  if (keys.length === 0) return [];
  const rooms = await redis.mget<Room[]>(...keys);
  
  const result: [string, Room][] = [];
  keys.forEach((key, index) => {
    const r = rooms[index];
    if (r) result.push([key.replace(ROOM_PREFIX, ""), r]);
  });
  return result;
}
