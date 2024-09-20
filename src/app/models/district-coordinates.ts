import { District } from "./district.type";
import { latLng, LatLngLiteral } from "leaflet";

const districtCoordinates: { [key in District]: LatLngLiteral } = {
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

export default districtCoordinates;