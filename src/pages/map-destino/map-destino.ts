import { Settings } from './../../providers/settings/settings';
import { Storage } from '@ionic/storage';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  MyLocation,
  GoogleMapsAnimation,
  Marker,
  Geocoder,
  GeocoderResult
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef } from "@angular/core/";
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-map-destino',
  templateUrl: 'map-destino.html',
})
export class MapDestinoPage {
  map: GoogleMap;
  loading: any;

  origen: any = {};
  dataStorage: any = {};


  @ViewChild('address', { read: ElementRef}) 
  address: ElementRef;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private settings: Settings) {


    this.dataStorage = this.settings.load();
  }

  ionViewDidLoad() {
    this.loading = this.loadingCtrl.create({
      content: 'Por favor espera...'
    });
    this.loadMap();
  }

  loadMap() {

    if (this.map)
    this.map.clear();

    let mapOptions: GoogleMapOptions = {
       'controls': {
        'compass': false,
        'myLocationButton': true,
        'myLocation': true,
        'indoorPicker': false,
        'zoom': false,
        'mapTypeControl': false,
        'streetViewControl': false
      },
      camera: {
         target: {
           lat: 43.0741904,
           lng: -89.3809802
         },
         zoom: 18,
         tilt: 30
       }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

   /* let marker: Marker = this.map.addMarkerSync({
      title: 'TuxCars',
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: 43.0741904,
        lng: -89.3809802
      }
    });
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        this.showToast('Esta no es tu ubicación');
    });*/
  }

  onEstablishAddress(event) {
    this.loading.present();
    this.map.clear();

    // Address -> latitude,longitude
    Geocoder.geocode({
      "address": this.address.nativeElement.value
    })
    .then((results: GeocoderResult[]) => {
      console.log(results);
      this.loading.dismiss();


      this.origen = results[0].position;

      let marker: Marker = this.map.addMarkerSync({
        'position': results[0].position,
        'title':  JSON.stringify(results[0].position)
      });
      this.map.animateCamera({
        'target': marker.getPosition(),
        'zoom': 17
      }).then(() => {
        marker.showInfoWindow();
      })
    });
  }

  onFindLocation(e) {
    this.loading.present();
    this.map.clear();

    // Get the location of you
    this.map.getMyLocation()
      .then((location: MyLocation) => {
        console.log('location', JSON.stringify(location, null ,2));


        this.loading.dismiss();

        // Move the map camera to the location with animation
        this.map.animateCamera({
          target: location.latLng,
          zoom: 17,
          tilt: 30
        })
        .then(() => {


          this.origen = location.latLng;

          // add a marker
          let marker: Marker = this.map.addMarkerSync({
            title: 'Tu te encuentras aquí',
            snippet: '',
            position: location.latLng,
            animation: GoogleMapsAnimation.BOUNCE
          });

          // show the infoWindow
          marker.showInfoWindow();

          // If clicked it, display the alert
          marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            this.showToast('Esta es tu ubicación');
          });
        });
      });
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top'
    });

    toast.present(toast);
  }

  seleccionaChofer() {
    this.navCtrl.push('ListMasterPage');
  }

  destino() {
     this.showToast(JSON.stringify(this.origen));
     this.settings.setValue('destino', JSON.stringify(this.origen));
  }


}




