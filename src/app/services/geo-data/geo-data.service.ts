import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { District } from "../../models/district.type";
import { Feature, FeatureCollection } from "geojson";

@Injectable({
    providedIn: "root",
})
export class GeoDataService {
    private url = "assets/data/portugal.geojson";
    private geoJson$: Observable<FeatureCollection>;

    constructor(private http: HttpClient) {
        this.geoJson$ = this.fetchGeoJson();
    }

    public getMunicipalityFeaturesByDistrictObservable(district: District) {
        return this.geoJson$.pipe(
            map((featureCollection: FeatureCollection) => {
                return featureCollection.features;
            }),
            map((features: Feature[]) => {
                return features.filter((feature) => {
                    return feature.properties!["District"] === district;
                });
            }),
        );
    }

    private fetchGeoJson(): Observable<FeatureCollection> {
        return this.http.get<FeatureCollection>(this.url).pipe(
            map((response) => {
                console.log("SUCCESS: Fetching GeoJSON.");
                return response;
            }),
            catchError((error) => {
                console.error("ERROR: Fetching GeoJSON.", error);
                throw error;
            }),
        );
    }
}
