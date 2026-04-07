import { NextRequest } from "next/server";
import { clients } from "../../../server/store.js";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const playerId = searchParams.get('playerId');

  if (!code || !playerId) {
    return new Response('Missing code or playerId', { status: 400 });
  }

  let controllerRef: ReadableStreamDefaultController | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      
      let roomListeners = clients.get(code);
      if (!roomListeners) {
        roomListeners = new Set();
        clients.set(code, roomListeners);
      }
      
      const client = { id: playerId, controller };
      roomListeners.add(client);
      
      const interval = setInterval(() => {
        try {
           controller.enqueue(new TextEncoder().encode(":\n\n"));
        } catch (err) {
           clearInterval(interval);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        roomListeners.delete(client);
        if (roomListeners.size === 0) clients.delete(code);
      });
    },
    cancel() {
      if (controllerRef) {
         let roomListeners = clients.get(code);
         if (roomListeners) {
            const toDelete = Array.from(roomListeners).find((c: any) => c.controller === controllerRef);
            if (toDelete) roomListeners.delete(toDelete);
         }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
