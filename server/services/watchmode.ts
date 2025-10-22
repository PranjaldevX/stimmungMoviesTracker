import axios from "axios";
import { StreamingSource } from "@shared/schema";
import { WATCHMODE_CONFIG } from "../config/api";

// Centralized API configuration - to switch providers,
// update the configuration in server/config/api.ts
const WATCHMODE_API_KEY = WATCHMODE_CONFIG.apiKey;
const WATCHMODE_BASE_URL = WATCHMODE_CONFIG.baseUrl;

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  web_url?: string;
  ios_url?: string;
  android_url?: string;
  format?: string;
  price?: number;
}

export async function getStreamingAvailability(
  imdbId: string
): Promise<StreamingSource[]> {
  if (!imdbId || !WATCHMODE_API_KEY) {
    return [];
  }

  try {
    // First, get the Watchmode title ID from IMDb ID
    const titleResponse = await axios.get(
      `${WATCHMODE_BASE_URL}/search/`,
      {
        params: {
          apiKey: WATCHMODE_API_KEY,
          search_field: "imdb_id",
          search_value: imdbId,
        },
      }
    );

    if (!titleResponse.data.title_results || titleResponse.data.title_results.length === 0) {
      return [];
    }

    const watchmodeId = titleResponse.data.title_results[0].id;

    // Get sources for this title
    const sourcesResponse = await axios.get(
      `${WATCHMODE_BASE_URL}/title/${watchmodeId}/sources/`,
      {
        params: {
          apiKey: WATCHMODE_API_KEY,
        },
      }
    );

    const sources = sourcesResponse.data as WatchmodeSource[];

    // Filter and map to our format
    const streamingSources: StreamingSource[] = sources
      .filter((source) => source.region === "US") // Focus on US for now
      .slice(0, 5) // Limit to top 5 sources
      .map((source) => ({
        name: source.name,
        type: source.type,
        webUrl: source.web_url,
        iosUrl: source.ios_url,
        androidUrl: source.android_url,
      }));

    return streamingSources;
  } catch (error) {
    console.error(`Error fetching Watchmode data for IMDb ${imdbId}:`, error);
    return [];
  }
}
