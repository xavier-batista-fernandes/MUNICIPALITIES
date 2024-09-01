import { District } from "../types/District";

export interface GeoJSONFeature {
    type: string;
    geometry: any;
    properties: {
        Municipality: string;
        District: District;
    };
}
