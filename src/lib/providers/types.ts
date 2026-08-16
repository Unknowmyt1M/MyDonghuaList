import type {
  NormalizedTitle,
  NormalizedSeason,
  NormalizedEpisode,
  NormalizedGenre,
  NormalizedPerson,
  SyncResult,
} from '@/types/donghua'

export type { SyncResult }

/**
 * Provider adapter contract — every external data source must implement this.
 * The ingestion worker calls these methods; results are normalized and merged
 * into TrackMyDonghua's PostgreSQL. External APIs are never the source of truth.
 */
export interface DataProvider {
  readonly id: string
  readonly name: string

  /** Search titles by query string. */
  searchTitles(query: string): Promise<NormalizedTitle[]>

  /** Fetch full title details by the provider's internal ID. */
  getTitle(providerId: string): Promise<NormalizedTitle | null>

  /** Fetch all seasons for a title. */
  getSeasons(titleId: string): Promise<NormalizedSeason[]>

  /** Fetch episodes for a specific season. */
  getEpisodes(seasonId: string): Promise<NormalizedEpisode[]>

  /** Optional: fetch genres/tags taxonomy. */
  getGenres?(): Promise<NormalizedGenre[]>

  /** Optional: fetch people (staff, cast). */
  getPeople?(): Promise<NormalizedPerson[]>

  /** Perform a full incremental sync and return counts. */
  sync?(): Promise<SyncResult>
}

/** Registry of enabled providers — populated at runtime from config. */
export const providers: DataProvider[] = []

export function registerProvider(provider: DataProvider) {
  providers.push(provider)
}

export function getProvider(id: string): DataProvider | undefined {
  return providers.find((p) => p.id === id)
}