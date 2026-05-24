# Entities

This is the canonical domain reference for agents and contributors. Read it before adding database models, API schemas, TypeScript types, tests, or UI state for domain features.

Backend Python, SQLite columns, and API JSON should use `snake_case` unless a schema explicitly documents an alias. IDs are UUID strings unless a specific internal table later chooses otherwise. Timestamps are ISO 8601 UTC.

## Core Principles

- `Run` is the root aggregate for mutable challenge state.
- `Room` is the access layer for shared runs, especially Soullink.
- The server is authoritative for shared state changes, rule validation, link creation, and death propagation.
- Reference data from PokeAPI is cached separately from user-created run state.
- The data model must support n-player Soullink links even when v1 UI focuses on two players.

## Run

A concrete Nuzlocke or Soullink playthrough.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary identifier. |
| `name` | string | User-facing run name. |
| `challenge_mode` | enum | `nuzlocke` or `soullink`. |
| `is_randomizer` | boolean | Randomizer is orthogonal to challenge mode. |
| `game_version_ref` | string | Reference key for edition/version. |
| `status` | enum | `active`, `completed_victory`, `failed_wipeout`, `archived`. |
| `notes` | string? | Free-form notes. |
| `room_id` | uuid? | Required for shared Soullink access, optional for solo. |
| `ruleset_id` | uuid | Active ruleset. |
| `randomizer_config_id` | uuid? | Present only when `is_randomizer` is true. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

## Room

Persistent access layer for a shared run.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Non-guessable room UUID used in room links. |
| `run_id` | uuid | Run owned by this room. |
| `join_code` | string | Short join code; can be regenerated or revoked. |
| `join_code_revoked_at` | datetime? | Null while current code is valid. |
| `read_only_token` | string? | Optional share token for viewers. |
| `password_hash` | string? | Optional room password hash. Never store plaintext. |
| `reset_email` | string? | Optional email for password reset only. |
| `reset_token_hash` | string? | Short-lived reset token hash. |
| `reset_token_expires_at` | datetime? | Expiration for reset token. |
| `created_by_member_id` | uuid? | Room creator, if known. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

## Member

Persistent participant membership in a room.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Participant identifier. |
| `room_id` | uuid | Room membership. |
| `display_name` | string | User-facing participant name. |
| `role` | enum | `owner`, `partner`, `viewer`. |
| `local_identity_key_hash` | string? | Optional anonymous device identity hash. |
| `joined_at` | datetime | Join timestamp. |
| `last_seen_at` | datetime? | Last observed activity. |

Viewer members are read-only. Owner and partner members have write access to the shared run.

## Presence

Ephemeral online state. This is not core persistence.

| Field | Type | Notes |
|---|---|---|
| `room_id` | uuid | Room scope. |
| `member_id` | uuid | Participant. |
| `online` | boolean | Current connection status. |
| `last_seen_at` | datetime | Last observed heartbeat. |

## Ruleset

Active rule configuration for a run.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Ruleset identifier. |
| `run_id` | uuid | Owning run. |
| `standard_rules` | string | Named preset, if used. |
| `clauses` | json | Enabled clauses and values. |
| `custom_rules` | json | User-defined house rules. |
| `level_cap_enabled` | boolean | Whether level cap validation is active. |
| `level_cap_source` | enum? | `manual`, `milestone`, or null. |
| `death_propagation_mode` | enum | Default `full_link`. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

Expected clauses include `dupes`, `shiny`, `species`, `nickname`, `gift_static_counts`, `set_battle_style`, and `no_battle_items`.

## RuleChange

Audit record for rule edits after run creation.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Change identifier. |
| `run_id` | uuid | Owning run. |
| `changed_by_member_id` | uuid? | Actor, if known. |
| `before` | json | Previous rule snapshot. |
| `after` | json | New rule snapshot. |
| `reason` | string? | Optional note. |
| `created_at` | datetime | Change timestamp. |

## LocationSlot

A trackable location or encounter slot in a run.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Slot identifier. |
| `run_id` | uuid | Owning run. |
| `name` | string | User-facing location name. |
| `sort_order` | integer | Play-order sorting. |
| `game_version_ref` | string? | Source version, if prefilled. |
| `reference_location_ref` | string? | PokeAPI location/location-area key. |
| `is_custom` | boolean | True when manually created or edited. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

## Encounter

The recorded encounter for a member in a location slot.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Encounter identifier. |
| `run_id` | uuid | Owning run. |
| `location_slot_id` | uuid | Location where encounter happened. |
| `member_id` | uuid? | Required for Soullink; optional for solo local identity. |
| `species_ref` | string? | Species key when known. |
| `nickname` | string? | Optional nickname. |
| `encounter_status` | enum | `caught`, `failed`, `fled`, `killed_before_catch`, `missed`, `dupe_skipped`. |
| `level` | integer? | Optional level. |
| `gender` | enum? | Optional gender. |
| `nature` | string? | Optional nature. |
| `ability` | string? | Optional ability. |
| `notes` | string? | Free-form notes. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

Only `caught` encounters create a managed `Pokemon` entity. Duplicate valid encounters in the same location are warnings unless a clause permits them.

## Pokemon

A caught Pokemon managed in team, box, or graveyard.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Pokemon identifier. |
| `run_id` | uuid | Owning run. |
| `encounter_id` | uuid | Source encounter. |
| `owner_member_id` | uuid? | Owner participant. |
| `species_ref` | string | Species key snapshot from encounter. |
| `nickname` | string? | Nickname snapshot or override. |
| `current_level` | integer? | Latest recorded level. |
| `roster_status` | enum | `team`, `box`, `graveyard`. |
| `life_status` | enum | `alive`, `dead`, `released`. |
| `death_at` | datetime? | Timestamp when marked dead/released. |
| `death_cause` | string? | User-provided death cause. |
| `death_source` | enum? | `manual`, `partner_death`, `system`. |
| `randomized_overrides` | json? | Optional display overrides for randomized type/evolution data. |
| `notes` | string? | Free-form notes. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

`team` is limited to six alive Pokemon per member. `dead` and `released` Pokemon must be in `graveyard`.

## LinkGroup

Soullink group connecting Pokemon caught in the same location.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Link identifier. |
| `run_id` | uuid | Owning run. |
| `location_slot_id` | uuid | Shared location. |
| `link_status` | enum | `incomplete`, `alive`, `dead`. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

## LinkMember

Join entity between `LinkGroup` and `Pokemon`.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Join identifier. |
| `link_group_id` | uuid | Owning link. |
| `pokemon_id` | uuid | Linked Pokemon. |
| `member_id` | uuid | Owner participant. |
| `created_at` | datetime | Creation timestamp. |

A link can contain two or more members. The default death propagation is full-link: when one member dies, all linked living members die in the same server transaction.

## Milestone

Progress marker such as gym leader, elite four, or story point.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Milestone identifier. |
| `run_id` | uuid | Owning run. |
| `name` | string | Display name. |
| `sort_order` | integer | Progress order. |
| `level_cap` | integer? | Optional cap tied to this milestone. |
| `is_reached` | boolean | Completion state. |
| `reached_at` | datetime? | Completion timestamp. |

## LogEntry

Chronological history for meaningful run events.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Log identifier. |
| `run_id` | uuid | Owning run. |
| `member_id` | uuid? | Actor, if known. |
| `event_type` | enum | `run_created`, `encounter_recorded`, `pokemon_moved`, `pokemon_died`, `link_created`, `rule_changed`, `milestone_reached`, `imported`, `exported`. |
| `description` | string | Human-readable summary. |
| `payload` | json? | Structured event details. |
| `created_at` | datetime | Event timestamp. |

## RandomizerConfig

Documentation and optional file for randomized runs.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Config identifier. |
| `run_id` | uuid | Owning run. |
| `seed` | string? | User-provided seed. |
| `settings_file_id` | uuid? | Uploaded settings file. |
| `extracted_metadata` | json? | Trivially readable metadata, not full bitfield decoding. |
| `notes` | string? | Free-form randomizer notes. |
| `shared_in_room` | boolean | Whether members can download it. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last mutation timestamp. |

## StoredFile

Server-side metadata for uploaded/downloadable files.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | File identifier. |
| `run_id` | uuid? | Optional run scope. |
| `room_id` | uuid? | Optional room scope. |
| `original_filename` | string | User-provided filename. |
| `content_type` | string | MIME type when known. |
| `size_bytes` | integer | File size. |
| `sha256` | string | Content hash. |
| `storage_path` | string | Internal path or object key. |
| `created_at` | datetime | Upload timestamp. |

## ReferenceSpecies

Cached PokeAPI species data.

| Field | Type | Notes |
|---|---|---|
| `species_ref` | string | Stable species key or PokeAPI id. |
| `name` | string | Display name. |
| `types` | json | One or more type names. |
| `sprite_ref` | string? | Cached sprite key/path. |
| `generation_ref` | string? | Generation key. |
| `cached_at` | datetime | Cache timestamp. |

## ReferenceLocation

Cached or curated location data.

| Field | Type | Notes |
|---|---|---|
| `location_ref` | string | Stable location/location-area key. |
| `game_version_ref` | string | Edition/version key. |
| `name` | string | Display name. |
| `sort_order` | integer | Suggested play order. |
| `source` | enum | `pokeapi`, `manual`, `curated`. |
| `cached_at` | datetime | Cache timestamp. |

## ExportDocument

Versioned JSON representation for backup/import. This does not need to be a database table.

| Field | Type | Notes |
|---|---|---|
| `schema_version` | string | Export format version. |
| `exported_at` | datetime | Export timestamp. |
| `run` | object | Run snapshot. |
| `ruleset` | object | Active rules. |
| `rooms` | object? | Room metadata safe for export. |
| `locations` | array | Location slots. |
| `encounters` | array | Encounters. |
| `pokemon` | array | Pokemon roster. |
| `links` | array | Link groups and members. |
| `milestones` | array | Milestones. |
| `log_entries` | array | Chronological log. |

Never export password hashes, reset token hashes, private local identity hashes, or other secrets.

## Cross-Entity Invariants

- A Soullink run uses `Room`, `Member`, `Encounter.member_id`, `Pokemon.owner_member_id`, and `LinkGroup`.
- Each `LocationSlot` can have at most one valid caught encounter per member unless rules allow an exception.
- Creating a caught encounter creates or updates exactly one managed `Pokemon`.
- Marking a linked Pokemon dead must update all affected Pokemon, the link status, and log entries in one server transaction.
- Moving Pokemon into `team` must enforce a maximum of six alive Pokemon per member.
- Team synchrony is a warning when linked partners are not all alive and in team together.
- Randomizer file metadata is documentary; it must not alter validation unless later requirements say so.
- Reference cache entities must never be mutated by run-specific randomizer overrides.

