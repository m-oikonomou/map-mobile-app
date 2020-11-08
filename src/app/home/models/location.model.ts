import {Marker} from './marker.model';

export class Location {

    latitude: number;
    longitude: number;
    mapType?: string;
    zoom?: number;
    markers?: Array<Marker>;
}