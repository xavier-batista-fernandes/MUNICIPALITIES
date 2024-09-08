import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { District } from "../../models/district.type";
import { Feature, FeatureCollection } from "geojson";

@Injectable({
    providedIn: "root",
})
export class GeoDataService {
    private url = "assets/geojson/portugal.geojson";
    private geoJson$: Observable<FeatureCollection>;

    constructor(private http: HttpClient) {
        this.geoJson$ = this.fetchGeoJson();
    }

    public getMunicipalities() {
        return this.geoJson$.pipe(
            map((featureCollection) => {
                return featureCollection.features;
            }),
        );
    }

    public getMunicipalitiesByDistrict(district: District): Observable<Feature[]> {
        return this.geoJson$.pipe(
            map((featureCollection) => {
                return featureCollection.features;
            }),
            map((feature) => {
                return feature.filter((municipality) => {
                    return municipality.properties!["District"] === district;
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
                return [];
            }),
        );
    }
}
