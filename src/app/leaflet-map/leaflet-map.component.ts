import { Component, effect, OnInit, Signal, signal } from "@angular/core";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import {
    geoJSON,
    latLng,
    Layer,
    MapOptions,
    TileLayer,
    tileLayer,
} from "leaflet";
import { GeoDataService } from "../services/geo-data/geo-data.service";
import { GeoJSONFeature } from "../models/GeoJSONFeature";
import { Observable, tap } from "rxjs";

@Component({
    selector: "app-leaflet-map",
    standalone: true,
    imports: [LeafletModule],
    templateUrl: "./leaflet-map.component.html",
    styleUrl: "./leaflet-map.component.css",
})
export class LeafletMapComponent implements OnInit {
    options!: MapOptions;
    layers!: Layer[];

    data$: Observable<GeoJSONFeature[]>;

    constructor(private geoDataService: GeoDataService) {
        this.data$ = this.geoDataService.getMunicipalitiesByDistrict("FARO");
    }

    //   addMunicipalitiesToMap(data$: Signal<any>) {
    //     if (!data$()) return;

    //     const geoJsonData = this.data$();
    //     const geoJsonLayers = geoJSON(geoJsonData);
    //     this.layers.push(geoJsonLayers);
    //   }

    ngOnInit(): void {
        const streetTileLayer: TileLayer = tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { keepBuffer: 50 },
        );

        this.options = {
            center: latLng(39.5, -5),
            keyboard: false,
            keyboardPanDelta: 300,
            minZoom: 5,
            maxZoom: 10,
            zoom: 6,
        };

        this.data$
            .pipe(
                tap((municipalities) => {
                    if (municipalities === undefined) return;

                    this.layers.push(geoJSON(municipalities as any[]));
                }),
            )
            .subscribe();

        this.layers = [streetTileLayer];
    }
}
