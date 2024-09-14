import { Component, OnInit, Signal, signal } from "@angular/core";
import {
    geoJSON,
    latLng,
    LatLngLiteral,
    LeafletMouseEvent,
    map,
    Map,
    MapOptions,
    PathOptions,
    Polyline
} from "leaflet";
import { GeoDataService } from "../services/geo-data/geo-data.service";

import { Observable, tap } from "rxjs";
import { Feature } from "geojson";
import { AsyncPipe } from "@angular/common";
import { District, districtTypes } from "../models/district.type";

/* Notes:
 * - LeafletEvent has a sourceTarget property.
 * - To each Layer a LeafletEventListener can be added.
 * - For each Layer a listener was configured for a click (LeafletMouseEvents).
 * - The sourceTarget property has the Layer that was clicked.
 */

const districtCoordinates: {[key in District]: LatLngLiteral} = {
    "AVEIRO": latLng(40.65, -8.5),
    "BEJA": latLng(37.8, -8),
    "BRAGA": latLng(41.55, -8.4),
    "BRAGANÇA": latLng(41.5, -6.95),
    "CASTELO BRANCO": latLng(39.95, -7.55),
    "COIMBRA": latLng(40.15, -8.35),
    "ÉVORA": latLng(38.6, -7.95),
    "FARO": latLng(37.25, -8.2),
    "GUARDA": latLng(40.7, -7.35),
    "LEIRIA": latLng(39.65, -8.7),
    "LISBOA": latLng(38.95, -9.2),
    "PORTALEGRE": latLng(39.2, -7.75),
    "PORTO": latLng(41.2, -8.35),
    "SANTARÉM": latLng(39.25, -8.55),
    "SETÚBAL": latLng(38.3, -8.7),
    "VIANA DO CASTELO": latLng(41.90, -8.55),
    "VILA REAL": latLng(41.55, -7.7),
    "VISEU": latLng(40.8, -7.9),
}

@Component({
    selector: "app-leaflet-map",
    standalone: true,
    templateUrl: "./leaflet-map.component.html",
    styleUrl: "./leaflet-map.component.css",
    imports: [AsyncPipe],
})
export class LeafletMapComponent implements OnInit {
    private map!: Map;

    private municipalityFeatures$!: Observable<Feature[]>;
    municipalityLayers!: Polyline[];

    private readonly district: District;


    constructor(
        private geoDataService: GeoDataService,
    ) {
        this.district = districtTypes[Math.floor(Math.random() * districtTypes.length)];
        console.log('>>>> SELECTED DISTRICT', this.district);
    }

    // TODO: forget the game service, implement directly in this game component.

    ngOnInit(): void {
        this.municipalityFeatures$ = this.geoDataService
            .getMunicipalityFeaturesByDistrict$(this.district);


        // Set the initial map options.
        const mapOptions: MapOptions = {
            center: districtCoordinates[this.district],
            doubleClickZoom: false,
            keyboard: false,
            keyboardPanDelta: 300,
            minZoom: 5,
            maxZoom: 10,
            zoom: 9,
        };

        // Create and render the map in the view.
        this.map = map("map", mapOptions);

        // Add the base layer to the map (the background).
        // const streetTileLayer: TileLayer = tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        //     keepBuffer: 50,
        // });
        //
        // streetTileLayer.addTo(this.map);

        this.map.whenReady(() => this.setupGame());
    }

    private setupGame() {
        // Add municipality layers to the map as soon as they are ready.
        this.municipalityFeatures$
            .pipe(
                tap((features) => {
                    // Don't do anything while municipalities aren't ready.
                    if (features === undefined) {
                        console.log("INFO: Features are not ready yet.");
                        return;
                    }

                    // Add fetched municipalities to the map.
                    this.municipalityLayers = geoJSON(features).getLayers() as Polyline[];

                    // Add each municipality of the selected district to the map.
                    this.municipalityLayers.forEach((municipality) => {
                        municipality.options = {
                            ...municipality.options,
                            color: "black",
                            weight: 1,
                            opacity: 1,
                            stroke: true,
                            fillColor: "grey",
                            fillOpacity: 0.75,
                        };
                        municipality.addTo(this.map);
                    });

                    this.municipalityLayers.forEach((layer) => {
                        layer.on("click", (event: LeafletMouseEvent) => {
                            const clickedMunicipality: string = event.target.feature.properties.Municipality;
                            // const isPlayCorrect: boolean = this.gameService.isMunicipalityCorrect(clickedMunicipality);
                            console.log("CLICKED ON", clickedMunicipality);

                            const polyline = event.target as Polyline;
                            let pathOptions: PathOptions;
                            if (true) {
                                pathOptions = {
                                    fillOpacity: 1,
                                    fillColor: "#568244",
                                };
                                (layer.getElement() as HTMLElement).style.cursor = "default";
                                layer.off("click");
                            } else {
                                pathOptions = {
                                    fillOpacity: 1,
                                    fillColor: "#e64855",
                                };
                            }
                            polyline.setStyle(pathOptions);
                        });
                    });
                }),
            )
            .subscribe((features) => {
                console.log(features);
            });
    }
}
