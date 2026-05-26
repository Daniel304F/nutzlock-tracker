import { useCallback, useState } from "react";

import {
  roomsApi,
  type RoomJoinInput,
  type RoomJoinResponse,
  type RoomResponse,
} from "@api/rooms";
import { getErrorMessage } from "@utils/getErrorMessage";

type JoinRoomStatus = "error" | "idle" | "joined" | "joining";

export type UseJoinRoomResult = {
  joinedRoom: RoomResponse | null;
  joinRoom: (input: RoomJoinInput) => Promise<RoomJoinResponse>;
  message: string | null;
  status: JoinRoomStatus;
};

export function useJoinRoom(): UseJoinRoomResult {
  const [joinedRoom, setJoinedRoom] = useState<RoomResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<JoinRoomStatus>("idle");

  const joinRoom = useCallback(async (input: RoomJoinInput) => {
    setStatus("joining");

    try {
      const response = await roomsApi.join(input);
      setJoinedRoom(response.room);
      setMessage(null);
      setStatus("joined");
      return response;
    } catch (error: unknown) {
      setJoinedRoom(null);
      setMessage(getErrorMessage(error, "Raum konnte nicht beigetreten werden"));
      setStatus("error");
      throw error;
    }
  }, []);

  return {
    joinedRoom,
    joinRoom,
    message,
    status,
  };
}
