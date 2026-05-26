import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@api/client";
import { roomsApi, type RoomJoinInput, type RoomResponse } from "@api/rooms";

vi.mock("@api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

const roomResponse: RoomResponse = {
  created_at: "2026-05-24T17:00:00Z",
  created_by_member_id: "member-1",
  id: "room-1",
  join_code: "ABCD2345EF",
  join_code_revoked_at: null,
  members: [
    {
      display_name: "Spieler 1",
      id: "member-1",
      joined_at: "2026-05-24T17:00:00Z",
      last_seen_at: null,
      role: "owner",
    },
  ],
  read_only_token: null,
  run_id: "run-1",
  updated_at: "2026-05-24T17:00:00Z",
};

describe("roomsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads a room through the shared API client", async () => {
    const signal = new AbortController().signal;
    mockedApiClient.get.mockResolvedValueOnce({ data: roomResponse });

    await expect(roomsApi.get("room-1", signal)).resolves.toEqual(roomResponse);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/rooms/room-1", { signal });
  });

  it("joins a room through the shared API client", async () => {
    const input: RoomJoinInput = {
      display_name: "Sam",
      join_code: "ABCD2345EF",
    };
    const joinedMember = {
      display_name: "Sam",
      id: "member-2",
      joined_at: "2026-05-24T17:05:00Z",
      last_seen_at: null,
      role: "partner" as const,
    };
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        member: joinedMember,
        room: {
          ...roomResponse,
          members: [...roomResponse.members, joinedMember],
        },
      },
    });

    await expect(roomsApi.join(input)).resolves.toEqual({
      member: joinedMember,
      room: {
        ...roomResponse,
        members: [...roomResponse.members, joinedMember],
      },
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith("/rooms/join", input);
  });
});
