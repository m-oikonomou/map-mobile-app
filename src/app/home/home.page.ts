// home.page.ts
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, AgmMap, MouseEvent } from '@agm/core';

import { MapsService } from './maps.service';
import { Marker } from './models/marker.model';
import { Location } from './models/location.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  title = 'Courier web map';
  lat;
  lng;
  zoom: number;
  markerLocations = [];
  location: Location;
  savedLocations: Array<Location> = [];
  selectedMarker: Marker;
  infoWindowView: number = 1;
  address: string;
  private geoCoder;
  @ViewChild('search') public searchElementRef: ElementRef;
  readonly rootURL = 'https://map-web-app-294820.firebaseio.com/savedLocations.json';
  @ViewChild(AgmMap) public agmMap: AgmMap;  //για να κάνει resize το bug που δεν εμφανίζεται ο χάρτης.

  constructor(private map: MapsService, private http: HttpClient, private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }


  ngOnInit() {
    this.location = {
      latitude: 37.99999556142096,
      longitude: 23.829345470004057,
      mapType: "satelite",
      zoom: 5,
      markers: [
        {
          lat: 37.99999556142096,
          lng: 23.829345470004057,
          label: "Athens"
        }
      ]
    }

    this.onGetLocationMarkers();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });

  }

  //Resize map
  ngAfterViewInit(): void {
    setTimeout(() => {
      console.log('Resizing');
      this.agmMap.triggerResize();
    }, 100);
  }


  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.lat, this.lng);
      });
    }
    this.location = {
      latitude: this.lat,
      longitude: this.lng,
      mapType: "satelite",
      zoom: 6,
      markers: [
        {
          lat: this.lat,
          lng: this.lng,
          label: ''
        }
      ]
    }
  }

  // onSelectLocation(event) {
  //   this.lat = event.coords.lat;
  //   this.lng = event.coords.lng;
  //   this.markerLocations.push([this.lat, this.lng]);
  //   console.log(this.markerLocations);
  // }

  addMarker(lat: number, lng: number, label: string) {
    this.location.markers.push({
      lat,
      lng,
      label //: 'lalala' //Date.now().toLocaleString()
    })
    console.log('irthaaaaaaaaaaaaaaaaaaaa');
  }

  onUpdateLocationMarkers(label: string, i: number) {
    this.location.markers[i].label = label;
    console.log(this.location.markers[i].label);

    this.infoWindowView = 0;
  }

  selectMarker(event) {
    this.selectedMarker = {
      lat: event.latitude,
      lng: event.longitude,
      label: 'hurray!'
    }
  }

  markerDragEnd(coords: any, $event: MouseEvent) {
    this.location.latitude = $event.coords.lat;
    this.location.longitude = $event.coords.lng;
    this.getAddress(this.lat, this.lng);
    console.log(this.location);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  onPostLocationMarkers() {
    this.map.postLocationMarkers(this.location).subscribe(
      res => {
        if ((res != null) || (res != undefined)) {
          
        }
      },
      err => {
        console.log(err);
      }
    )
  }

  onGetLocationMarkers() {
    this.http.get(this.rootURL).pipe(map(responseData => {
      const savedLocations: Location[] = [];
      for (const key in responseData) {
        if (responseData.hasOwnProperty(key)) {
          savedLocations.push({ ...responseData[key], id: key });
        }
      }
      return savedLocations;
    })).subscribe(
      (res: any) => {
        if ((res != null) || (res != undefined)) {
          //console.log(res);

          const responseData = new Array<Location>(...res);

          for (const data of responseData) {
            const markers = data.markers;
            for (const marker of markers) {
              const resObj = new Location();

              console.log(marker.lat, marker.lng, marker.label);

              this.addMarker(marker.lat, marker.lng, marker.label);
            }
          }

        }
      },
      err => {
        //console.log(err);
      }
    )
  }

  onDeleteLocationMarkers(i: number) {
    // this.http.delete(this.rootURL + this.location.markers[i]).subscribe(data => {
    //   console.log(data);
    // });

    this.location.markers[i] = {
      lat: 0,
      lng: 0,
      label: '' //Date.now().toLocaleString()
    };
  }

  onChangeInfoWindowView(i: number, numView: number) {
    // if (this.infoWindowView == 0) {
    //   this.infoWindowView = 1;
    // }
    // else if (this.infoWindowView == 1) {
    //   this.infoWindowView = 2;
    // }
    // else if (this.infoWindowView = 2) {
    //   this.infoWindowView = 0;
    // }

    this.infoWindowView = numView;
  }

  saveLocation() {
    const data = {
      address: this.address,
      latitude: this.lat,
      longitude: this.lng
    }

    this.location = {
      latitude: data.latitude,
      longitude: data.longitude,
      mapType: "satelite",
      zoom: 12,
      markers: [
        {
          lat: data.latitude,
          lng: data.longitude,
          label: data.address
        }
      ]
    }

    this.addMarker(data.latitude, data.longitude, data.address);
  }

}
