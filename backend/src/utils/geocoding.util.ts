import { Injectable } from '@nestjs/common';

export type GeocodeSuggestion = {
    name: string;
    address: string;
    lat: number;
    lng: number;
};

@Injectable()
export class GeocodingUtil {
    async searchLocations(query: string): Promise<GeocodeSuggestion[]> {
        if (!query || query.trim().length === 0) return [];

        try {
            const url =
                `https://nominatim.openstreetmap.org/search` +
                `?q=${encodeURIComponent(query.trim())}` +
                `&format=json&addressdetails=1&limit=15&countrycodes=vn`;

            const response = await fetch(url, {
                headers: {
                    'Accept-Language': 'vi-VN,vi;q=0.9',
                    'User-Agent': 'BusTicketingSystem/1.0',
                },
            });

            if (!response.ok) return [];

            const data = await response.json();
            if (!Array.isArray(data)) return [];

            const mapped: GeocodeSuggestion[] = data
                .map((item: any) => ({
                    name: item.name || String(item.display_name || '').split(',')[0],
                    address: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                }))
                .filter((item) => !Number.isNaN(item.lat) && !Number.isNaN(item.lng));

            return this.dedupeSuggestions(mapped);
        } catch (error) {
            console.error('Geocoding search error:', error);
            return [];
        }
    }

    private dedupeSuggestions(items: GeocodeSuggestion[]): GeocodeSuggestion[] {
        const seen = new Set<string>();
        const result: GeocodeSuggestion[] = [];

        for (const item of items) {
            const key = item.address.trim().toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            result.push(item);
            if (result.length >= 10) break;
        }

        return result;
    }
}
