import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, map as rxjsMap, map, Observable, tap } from "rxjs";
import { District } from "../../models/district.type";
import { Feature, FeatureCollection } from "geojson";

@Injectable({
    providedIn: "root",
})
export class GeoDataService {
    private url = "assets/geojson/portugal.geojson";
    private geoJson$: Observable<FeatureCollection>;

    private municipalities: BehaviorSubject<Map<District, string[]>> = new BehaviorSubject(new Map());

    constructor(private http: HttpClient) {
        this.geoJson$ = this.fetchGeoJson();
    }

    public getMunicipalityFeatures$() {
        return this.geoJson$.pipe(
            map((featureCollection) => {
                return featureCollection.features;
            }),
        );
    }

    public getDistrictsObservable(): Observable<District[]> {
        return this.getMunicipalityFeatures$().pipe(
            map((features: Feature[]) => {
                const districtRepeated: District[] = features.map((f) => {
                    return f.properties!["District"];
                });

                return [...new Set(districtRepeated)];
            }),
        );
    }



    public getMunicipalityFeaturesByDistrict$(district: District) {
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
