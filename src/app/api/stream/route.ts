import { NextRequest } from "next/server";
import { getRoom } from "../../../server/roomManager";
import { roomStreams } from "../../../server/store";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const playerId = searchParams.get('playerId');

  if (!code || !playerId) {
    return new Response('Missing code or playerId', { status: 400 });
  }

  const room = getRoom(code);
  if (!room) {
    return new Response('Room not found', { status: 404 });
  }

  let controller: ReadableStreamDefaultController;
  
  const stream = new ReadableStream({
    start(c) {
      controller = c;
      
      let streams = roomStreams.get(code);
      if (!streams) {
        streams = new Set();
        roomStreams.set(code, streams);
      }
      streams.add(controller);
      
      // Send initial state
      const data = `data: ${JSON.stringify(room)}\n\n`;
      try {
        controller.enqueue(new TextEncoder().encode(data));
      } catch (e) {
        // Ignored
      }
    },
    cancel() {
      const streams = roomStreams.get(code);
      if (streams && controller) {
        streams.delete(controller);
        if (streams.size === 0) {
          roomStreams.delete(code);
        }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
