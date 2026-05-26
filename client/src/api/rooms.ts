import { apiClient } from "@api/client";

export type MemberRole = "owner" | "partner" | "viewer";

export type RoomMemberResponse = {
  display_name: string;
  id: string;
  joined_at: string;
  last_seen_at: string | null;
  role: MemberRole;
};

export type RoomResponse = {
  created_at: string;
  created_by_member_id: string | null;
  id: string;
  join_code: string;
  join_code_revoked_at: string | null;
  members: RoomMemberResponse[];
  read_only_token: string | null;
  run_id: string;
  updated_at: string;
};

export type RoomJoinInput = {
  display_name: string;
  join_code: string;
};

export type RoomJoinResponse = {
  member: RoomMemberResponse;
  room: RoomResponse;
};

export const roomsApi = {
  get: async (roomId: string, signal?: AbortSignal): Promise<RoomResponse> => {
    const { data } = await apiClient.get<RoomResponse>(`/rooms/${roomId}`, { signal });
    return data;
  },
  join: async (input: RoomJoinInput): Promise<RoomJoinResponse> => {
    const { data } = await apiClient.post<RoomJoinResponse>("/rooms/join", input);
    return data;
  },
};
