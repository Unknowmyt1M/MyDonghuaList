export type TitleType = 'TV' | 'ONA' | 'Movie' | 'OVA' | 'Special' | 'Short'
export type TitleStatus = 'Upcoming' | 'Airing' | 'Completed' | 'Hiatus' | 'Cancelled'
export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'

export interface NormalizedTitle {
  providerId: string
  title: string
  originalTitle: string
  nativeTitle: string
  synonyms: string[]
  description: string
  coverUrl: string
  bannerUrl: string
  type: TitleType
  status: TitleStatus
  releaseYear: number
  startDate?: string
  endDate?: string
  totalEpisodes: number
  duration: number
  source: string
  genres: NormalizedGenre[]
  tags: string[]
}

export interface NormalizedSeason {
  seasonNumber: number
  name: string
  description: string
  posterUrl: string
  releaseDate?: string
}

export interface NormalizedEpisode {
  episodeNumber: number
  absoluteNumber?: number
  title: string
  description: string
  thumbnailUrl: string
  airDate?: string
  airTime?: string
  duration: number
  status: string
  externalId: string
}

export interface NormalizedGenre {
  name: string
  slug: string
}

export interface NormalizedPerson {
  providerId: string
  name: string
  nativeName?: string
  role: 'director' | 'writer' | 'voice_actor' | 'producer' | 'staff'
  imageUrl?: string
}

export interface SyncResult {
  titlesUpdated: number
  episodesUpdated: number
  failures: string[]
}