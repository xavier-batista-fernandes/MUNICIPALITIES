import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { geoJSON, LeafletMouseEvent, map, Map, MapOptions, PathOptions, Polyline } from "leaflet";
import { GeoDataService } from "../../services/geo-data/geo-data.service";
import { tap } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { District, districtTypes } from "../../models/district.type";
import districtCoordinates from "../../models/district-coordinates";
import shuffleArray from "../../utils/shuffleArray";

/* Notes:
 * - LeafletEvent has a sourceTarget property.
 * - To each Layer a LeafletEventListener can be added.
 * - For each Layer a listener was configured for a click (LeafletMouseEvents).
 * - The sourceTarget property has the Layer that was clicked.
 */

@Component({
    selector: "app-game",
    standalone: true,
    templateUrl: "./game.component.html",
    styleUrl: "./game.component.css",
    imports: [AsyncPipe],
})
export class GameComponent implements OnInit {
    // Map related variables.
    private map!: Map;
    private municipalityLayers!: Polyline[];

    // TODO: investigate how this can me achieved
    private municipalityDefaultOptions: PathOptions = {
        color: "black",
        weight: 1,
        opacity: 1,
        stroke: true,
        fillColor: "grey",
        fillOpacity: 0.75,
    };

    // Game related variables.
    protected readonly district: District;
    protected remainingMunicipalities: string[] = [];
    protected targetMunicipality: string = "";
    protected remainingAttempts: number = 3;
    private incorrectMunicipalities: any[] = [];

    // Events
    // TODO: investigate how to do this with signals
    @Output() back = new EventEmitter<void>();

    constructor(private geoDataService: GeoDataService) {
        this.district = districtTypes[Math.floor(Math.random() * districtTypes.length)];
        console.log("District:", this.district);
    }

    ngOnInit(): void {
        // Set the initial map options.
        const mapOptions: MapOptions = {
            center: districtCoordinates[this.district],
            doubleClickZoom: false,
            keyboard: false,
            keyboardPanDelta: 300,
            minZoom: 9,
            maxZoom: 10,
            zoom: 9,
        };

        // Create and render the map in the view.
        this.map = map("map", mapOptions);

        // Add the base layer to the map (the background).
        // TODO: check if this layer can be loaded from local files instead of an api.
        // const streetTileLayer: TileLayer = tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        //     keepBuffer: 50,
        // });
        // streetTileLayer.addTo(this.map);

        // Setup the game as soon as the map is ready.
        // TODO: implement loading page?
        this.map.whenReady(() => this.setupGame());
    }

    private getCorrectColor(remainingAttempts: number): string {
        let color = "#4599ed";
        switch (remainingAttempts) {
            case 3:
                color = "#0fb802";
                break;
            case 2:
                color = "#89cc04";
                break;
            case 1:
                color = "#c5cc04";
                break;
        }

        return color;
    }

    private setupGame() {
        this.geoDataService
            .getMunicipalityFeaturesByDistrictObservable(this.district)
            .pipe(
                // Load the municipalities from the selected district and shuffle them.
                tap((features) => {
                    console.log("Setup: loading and shuffling municipalities...");
                    this.remainingMunicipalities = features.map((feature) => {
                        return feature.properties!["Municipality"];
                    });
                    shuffleArray(this.remainingMunicipalities);
                    this.targetMunicipality = this.remainingMunicipalities.pop() ?? "Something went wrong...";
                }),
                // Add each municipality to the map.
                tap((features) => {
                    console.log("Setup: adding municipalities as layers to the map...");
                    this.municipalityLayers = geoJSON(features).getLayers() as Polyline[];

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
                }),
                tap(() => {
                    console.log("Setup: configuring event listeners to every layer...");
                    // Listen to clicks on the municipalities.
                    this.municipalityLayers.forEach((layer) => {
                        layer.on("click", (event: LeafletMouseEvent) => {
                            console.log("DEBUG: click");

                            const clickedMunicipality: string = event.target.feature.properties.Municipality;
                            const isClickCorrect = clickedMunicipality === this.targetMunicipality;
                            const layerElement: HTMLElement = layer.getElement() as HTMLElement;

                            // Do not perform any action when click is invalid.
                            const isClickInvalid =
                                !isClickCorrect &&
                                (!this.remainingMunicipalities.includes(clickedMunicipality) ||
                                    this.incorrectMunicipalities
                                        .map((m) => {
                                            return m.feature.properties!["Municipality"];
                                        })
                                        .includes(clickedMunicipality));
                            if (isClickInvalid) {
                                console.log("DEBUG: invalid click");
                                return;
                            }

                            // Update style of the municipality that was clicked.
                            layerElement.style.cursor = "default";

                            if (isClickCorrect) {
                                this.targetMunicipality = this.remainingMunicipalities.pop() ?? "";

                                // Clear incorrect clicks
                                this.incorrectMunicipalities.forEach((layer) => {
                                    (layer as Polyline).setStyle({ fillColor: "grey", fillOpacity: 0.75 });
                                    (layer.getElement() as HTMLElement).style.cursor = "pointer";
                                });
                                this.incorrectMunicipalities = [];
                            } else {
                                console.log("DEBUG: incorrect play");
                                this.incorrectMunicipalities.push(layer);
                                this.remainingAttempts -= 1;
                            }

                            const pathOptions: PathOptions = isClickCorrect
                                ? {
                                      fillOpacity: 1,
                                      fillColor: this.getCorrectColor(this.remainingAttempts),
                                  }
                                : {
                                      fillOpacity: 1,
                                      fillColor: "#757575",
                                  };

                            const polyline = event.target as Polyline;
                            polyline.setStyle(pathOptions);
                        });
                    });
                }),
            )
            .subscribe(() => {
                console.log("Setup: complete!");
            });
    }
}
