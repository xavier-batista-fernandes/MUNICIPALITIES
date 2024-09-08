import { Component, OnInit } from "@angular/core";
import {
    geoJSON,
    latLng,
    Map,
    map,
    MapOptions,
    PathOptions,
    Polyline,
    PolylineOptions,
    TileLayer,
    tileLayer,
} from "leaflet";
import { GeoDataService } from "../services/geo-data/geo-data.service";

import { Observable, tap } from "rxjs";
import { Feature } from "geojson";

/* Notes:
 * - LeafletEvent has a sourceTarget property.
 * - To each Layer a LeafletEventListener can be added.
 * - For each Layer a listener was configured for a click (LeafletMouseEvents).
 * - The sourceTarget property has the Layer that was clicked.
 */

@Component({
    selector: "app-leaflet-map",
    standalone: true,
    templateUrl: "./leaflet-map.component.html",
    styleUrl: "./leaflet-map.component.css",
})
export class LeafletMapComponent implements OnInit {
    private map!: Map;

    private municipalityFeatures$: Observable<Feature[]>;
    municipalityLayers!: Polyline[];

    constructor(private geoDataService: GeoDataService) {
        this.municipalityFeatures$ = this.geoDataService.getMunicipalitiesByDistrict("LEIRIA");
    }

    ngOnInit(): void {
        // Set the initial map options.
        const mapOptions: MapOptions = {
            center: latLng(39.75, -8.8),
            keyboard: false,
            keyboardPanDelta: 300,
            minZoom: 5,
            maxZoom: 10,
            zoom: 9,
        };

        // Create and render the map in the view.
        this.map = map("map", mapOptions);

        // Add the base layer to the map (the background).
        const streetTileLayer: TileLayer = tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            keepBuffer: 50,
        });

        streetTileLayer.addTo(this.map);

        this.map.whenReady(() => this.onMapReady());
    }

    onMapReady() {
        // Add municipality layers to the map as soon as they are ready.
        this.municipalityFeatures$
            .pipe(
                tap((features) => {
                    // Don't do anything while municipalities aren't ready.
                    if (features === undefined) return;

                    // Add fetched municipalities to the map.
                    this.municipalityLayers = geoJSON(features).getLayers() as Polyline[];
                    console.log(">>>> layers", this.municipalityLayers);

                    this.municipalityLayers.forEach((municipality) => {
                        const baseMunicipalityOptions: PolylineOptions = {
                            ...municipality.options,
                            color: "black",
                            weight: 1,
                            opacity: 1,
                            stroke: true,
                            fillColor: "grey",
                            fillOpacity: 0.75,
                        };

                        municipality.options = baseMunicipalityOptions;
                        municipality.addTo(this.map);

                        municipality.on("click", (event) => {
                            const polyline = event.target as Polyline;
                            const pathOptions: PathOptions = {
                                fillOpacity: 1,
                                fillColor: "green",
                            };
                            console.log("event:", polyline.setStyle(pathOptions));
                            // console.log('CLICK ON', municipality.feature?.properties.Municipality);
                            // municipality.options.fillColor = 'red'
                        });
                    });

                    // this.municipalityLayers.forEach((municipality) => {
                    //     console.log(">>>>> MUNICIPALITY LAYER: ", municipality);
                    //     municipality.addEventListener("click", ($event) =>
                    //         this.onMunicipalityClick($event, municipality),
                    //     );
                    // });
                }),
            )
            .subscribe();
    }

    // // FIXME: perhaps ignore npx completely and do traditional leaflet with typescript imp
    // // TODO: figure out why when array changes
    // private onMunicipalityClick($event: LeafletMouseEvent, municipality: Polyline): void {
    //     const clickedLayerFeature: Feature = $event.sourceTarget.feature;
    //     const options: PolylineOptions = $event.sourceTarget.options;
    //     // const clickedLayerOption: any = $event.sourceTarget.o;
    //     // console.log(">>>>> MUNICIPALITY CLICKED: ", clickedLayerFeature.properties);
    //     // console.log(">>>>> OPTIONS: ", options);
    //     // console.log(">>>>> Municipality: ", municipality);
    //     const oldLayers =  this.municipalityLayers;
    //     console.log("before " , this.municipalityLayers);
    //
    //     this.municipalityLayers.forEach((municipality) => {
    //         console.log("Feature:");
    //         if (municipality.feature!.properties.Municipality === $event.sourceTarget.feature.properties.Municipality) {
    //             console.log("filtering");
    //             // return false;
    //         }
    //         // return true;
    //     });
    //
    //     console.log("after", this.municipalityLayers);
    //     console.log("same?", this.municipalityLayers === oldLayers);
    //
    // }
}
