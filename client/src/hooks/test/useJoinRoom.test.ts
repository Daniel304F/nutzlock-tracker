import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { roomsApi, type RoomJoinInput, type RoomJoinResponse } from "@api/rooms";
import { useJoinRoom } from "@hooks/useJoinRoom";

vi.mock("@api/rooms", () => ({
  roomsApi: {
    join: vi.fn(),
  },
}));

const mockedRoomsApi = vi.mocked(roomsApi);

const joinInput: RoomJoinInput = {
  display_name: "Sam",
  join_code: "ABCD2345EF",
};

const joinResponse: RoomJoinResponse = {
  member: {
    display_name: "Sam",
    id: "member-2",
    joined_at: "2026-05-24T17:05:00Z",
    last_seen_at: null,
    role: "partner",
  },
  room: {
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
    updated_at: "2026-05-24T17:05:00Z",
  },
};

describe("useJoinRoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("joins a room and stores the joined room", async () => {
    mockedRoomsApi.join.mockResolvedValueOnce(joinResponse);

    const { result } = renderHook(() => useJoinRoom());

    await act(async () => {
      await result.current.joinRoom(joinInput);
    });

    expect(mockedRoomsApi.join).toHaveBeenCalledWith(joinInput);
    expect(result.current.status).toBe("joined");
    expect(result.current.joinedRoom).toEqual(joinResponse.room);
    expect(result.current.message).toBeNull();
  });

  it("surfaces join errors", async () => {
    mockedRoomsApi.join.mockRejectedValueOnce(new Error("Room not found"));

    const { result } = renderHook(() => useJoinRoom());

    await act(async () => {
      await expect(result.current.joinRoom(joinInput)).rejects.toThrow("Room not found");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.joinedRoom).toBeNull();
    expect(result.current.message).toBe("Room not found");
  });
});
