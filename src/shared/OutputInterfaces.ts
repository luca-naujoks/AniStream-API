// Media interface is inherited from the media.entity
export interface IBackendConfig {
  TmdbApiKey: string;
  AnimeDir: string;
  SeriesDir: string;
  PageSize: number;
}

export interface IDetailedMedia {
  id: number;
  type: string; // unknown
  tmdb_id: number; // id
  external_identifier: string; // unknown
  name: string; // name
  tags: { id: number; name: string }[]; // unknown
  poster: string; // poster_path
  backdrop: string; // backdrop_path

  vote_average: number; // -->
  original_name: string; // -->
  overview: string; // -->
  original_language: string; // -->
  first_air_date: string; // -->
  status: string; // unknown
  episode_run_time: number; // unknown
  number_of_episodes: number; // unknown
  production_country: string; // unknown

  seasons: { name: string; season_number: number }[]; // unknown
}

export interface ISeason {
  episodes: IEpisode[];
}

interface IEpisode {
  name: string;
  air_date: string;
  episode_number: number;
  episode_type: string;
  local_available: boolean;
}
