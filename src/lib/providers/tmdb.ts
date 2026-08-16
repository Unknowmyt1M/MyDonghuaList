import type { DataProvider, SyncResult } from './types'
import type {
  NormalizedTitle,
  NormalizedSeason,
  NormalizedEpisode,
  NormalizedGenre,
} from '@/types/donghua'

/**
 * TMDB provider skeleton — no API key in Phase 0.
 * Phase 1 will implement real requests respecting 40 req/s and 429 handling.
 */
export const tmdbProvider: DataProvider = {
  id: 'tmdb',
  name: 'The Movie Database (TMDB)',

  async searchTitles(_query: string): Promise<NormalizedTitle[]> {
    console.warn('[TMDB] searchTitles not implemented (Phase 1)')
    return []
  },

  async getTitle(_providerId: string): Promise<NormalizedTitle | null> {
    console.warn('[TMDB] getTitle not implemented (Phase 1)')
    return null
  },

  async getSeasons(_titleId: string): Promise<NormalizedSeason[]> {
    console.warn('[TMDB] getSeasons not implemented (Phase 1)')
    return []
  },

  async getEpisodes(_seasonId: string): Promise<NormalizedEpisode[]> {
    console.warn('[TMDB] getEpisodes not implemented (Phase 1)')
    return []
  },

  async getGenres(): Promise<NormalizedGenre[]> {
    console.warn('[TMDB] getGenres not implemented (Phase 1)')
    return []
  },

  async sync(): Promise<SyncResult> {
    console.warn('[TMDB] sync not implemented (Phase 1)')
    return { titlesUpdated: 0, episodesUpdated: 0, failures: [] }
  },
}

/** Register TMDB if you have an API key (Phase 1). */
// import { registerProvider } from './types'
// registerProvider(tmdbProvider)