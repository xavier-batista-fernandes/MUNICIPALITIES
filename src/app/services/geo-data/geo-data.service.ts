import { HttpClient } from "@angular/common/http";
import { computed, Injectable, Signal, signal } from "@angular/core";
import { catchError, filter, map, Observable, tap } from "rxjs";
import { GeoJSONFeatureCollection } from "../../models/GeoJSONFeatureCollection";
import { GeoJSONFeature } from "../../models/GeoJSONFeature";
import { District } from "../../types/District";

@Injectable({
    providedIn: "root",
})
export class GeoDataService {
    private url = "assets/geojson/portugal.geojson";
    private geoData$: Observable<GeoJSONFeature[]>;

    constructor(private http: HttpClient) {
        this.geoData$ = this.fetchGeoData();
    }

    public getMunicipalities() {
        return this.geoData$;
    }

    public getMunicipalitiesByDistrict(
        district: District,
    ): Observable<GeoJSONFeature[]> {
        return this.geoData$.pipe(
            map((municipalities) =>
                municipalities.filter(
                    (m) => m.properties.District === district,
                ),
            ),
        );
    }

    private fetchGeoData(): Observable<GeoJSONFeature[]> {
        return this.http.get<GeoJSONFeatureCollection>(this.url).pipe(
            map((response) => {
                console.log("SUCCESS: Fetching GeoJSON.");
                return response.features;
            }),
            catchError((error) => {
                console.error("ERROR: Fetching GeoJSON.", error);
                return [];
            }),
        );
    }
}
