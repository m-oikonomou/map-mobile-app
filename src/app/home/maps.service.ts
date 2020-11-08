import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Marker } from './models/marker.model';
import { Location } from './models/location.model';
import { map } from 'rxjs/operators';


@Injectable()
export class MapsService {
    value: Location;
    readonly rootURL = 'https://map-web-app-294820.firebaseio.com/savedLocations.json';

    constructor(private http: HttpClient) { }

    postLocationMarkers(value: Location) {
        console.log(value);
        return this.http.post(this.rootURL, value);
    }

    getLocationMarkers(value: Location) {
        console.log(value);
        return this.http.get(this.rootURL).pipe(map(responseData => {
            const savedLocations = [];
            for (const key in responseData) {
                if (responseData.hasOwnProperty(key)) {
                    savedLocations.push({ ...responseData[key], id: key });
                }
            }
            //return savedLocations;
        }));
    }

}