import { MapService } from './map.service';
import { Settings } from './../../providers/settings/settings';
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
  GeocoderResult,
  ILatLng,
  LatLng,
  Polyline
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef } from "@angular/core/";
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  map: GoogleMap;
  loading: any;
  loading_wait: any;

  origen: ILatLng;
  _origen: ILatLng;
  dataStorage: any = {};

  elegirDestino: boolean = false;
  origenSeteado: boolean = false;
  destinoSeteado: boolean = false;

  selectPoint: string = 'Origen';
  strAddress: any = '';

  _strAddress: any = '';

  estado: string = 'Inicia';

  @ViewChild('address', { read: ElementRef}) 
  address: ElementRef;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private settings: Settings,
    private mapService: MapService) {
    
      if (this.origenSeteado && !this.destinoSeteado) {
        this.selectPoint = 'Destino';
      }

      if (this.origenSeteado && this.destinoSeteado) {
        this.selectPoint = 'Finalizado';
      }

      this.estado = 'Selecciona';
      
      if (this.navParams.get('estado')) {
      this.estado = this.navParams.get('estado');
      console.log('estado', this.estado);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
    this.loading_wait = this.loadingCtrl.create({
      content: 'Por favor espera...'
    })
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter this.map', this.map);
    this.loadMap();
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
  }

  loadMap() {
    let mapOptions: GoogleMapOptions = {
      'controls': {
        'compass': false,
        'myLocationButton': false,
        'myLocation': false,
        'indoorPicker': false,
        'zoom': false,
        'mapTypeControl': false,
        'streetViewControl': false
      },
      camera: {
         target: {
           lat: 19.7123466,
           lng: -103.4626141
         },
         zoom: 14,
         tilt: 30
       }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);
  }

  calculateAndDisplayRoute(origen, destino) {
    console.log('__origen',JSON.stringify(origen));
    console.log('__destino', JSON.stringify(destino));
    this.mapService.calculateRute(origen, destino)
      .subscribe(result => {
        console.log('result form api servicec', JSON.stringify(result));
      });
  }

  onEstablishAddress(event) {
    this.loading_wait.present();
    this.map.clear();

    // Address -> latitude,longitude
    Geocoder.geocode({
      "address": this.address.nativeElement.value
    })
    .then((results: GeocoderResult[]) => {

      if (results.length == 0) {
        // Not found
        return null;
      }

      this.loading_wait.dismiss();

      this.strAddress = [
        results[0].subThoroughfare || "",
        results[0].thoroughfare || "",
        results[0].locality || "",
        results[0].adminArea || "",
        results[0].postalCode || "",
        results[0].country || ""].join(", ");

      /** POLYLINE solo de porueba pero no se incluirá */

      const DIR_ORIGEN = this._strAddress;
      const DIR_DESTINO = this.strAddress;


        const ORIGEN = {'lat': this._origen.lat, 'lng': this._origen.lng};
        const DESTINO =  {'lat': results[0].position.lat, 'lng':  results[0].position.lng};
        const RUTA = [
          ORIGEN,
          DESTINO
        ];

        let polyline: Polyline = this.map.addPolylineSync({
          points: RUTA,
          color: '#AA00FF',
          width: 10,
          geodesic: true,
          clickable: true  // clickable = false in default
        });

        polyline.on(GoogleMapsEvent.POLYLINE_CLICK).subscribe((params: any) => {
        let position: LatLng = <LatLng>params[0];

        let marker: Marker = this.map.addMarkerSync({
          position: position,
          title: position.toUrlValue(),
          disableAutoPan: true,
          snippet: this.strAddress,
          animation: GoogleMapsAnimation.BOUNCE
        });
        marker.showInfoWindow();
      });

      this.calculateAndDisplayRoute(DIR_ORIGEN, DIR_DESTINO);

      this.origen = results[0].position;
    });
  }

  onFindLocation(e) {
    this.loading_wait.present();
    this.map.clear();

    // Get the location of you
    this.map.getMyLocation()
      .then((location: MyLocation) => {

        console.log('location', JSON.stringify(location, null ,2));

        this.loading_wait.dismiss();

        // Move the map camera to the location with animation
        this.map.animateCamera({
          target: location.latLng,
          zoom: 17,
          tilt: 30,
          bearing: 140,
          duration: 500
        })
        .then(() => {

          Geocoder.geocode({
              "position": location.latLng
            })
            .then((results: GeocoderResult[]) => {

              if (results.length == 0) {
                // Not found
                return null;
              }

              this.strAddress = [
                results[0].subThoroughfare || "",
                results[0].thoroughfare || "",
                results[0].locality || "",
                results[0].adminArea || "",
                results[0].postalCode || "",
                results[0].country || ""].join(", ");

              this._strAddress = this.strAddress;


              this.origen = location.latLng;
              this._origen =  location.latLng;

              // add a marker
              let marker: Marker = this.map.addMarkerSync({
                title: 'Tu te encuentras aquí',
                snippet: this.strAddress,
                position: location.latLng,
                animation: GoogleMapsAnimation.BOUNCE
              });

              // show the infoWindow
              marker.showInfoWindow();

              // If clicked it, display the alert
              marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
                this.showToast('Esta es la tu ubicación');
              });


            })

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

  setUbicacion() {

    this.map.clear();
    
    if (!this.origenSeteado) {

      this.loading = this.loadingCtrl.create({
        content: 'Ahora elige el destino'
      });
      this.loading.present();
      this.loading.dismiss();
      this.selectPoint = 'Destino';
      this.elegirDestino = true;

      if (this.origen !== undefined) {
        console.log('origen');
        this.origen['address'] = this.strAddress;
        this.strAddress = '';
        this.settings.setValue('origen', this.origen);
        this.origenSeteado = true;
        this.origen = null;
      } else {
        console.log('Error al setear origen');
      }

    } else if (this.origenSeteado && !this.destinoSeteado) {

      this.loading = this.loadingCtrl.create({
        content: 'Ahora elige un carro'
      });
      this.loading.present();
      this.loading.dismiss();
      this.selectPoint = 'Carro';

      if (this.origen !== undefined) {
        console.log('destino');
        this.origen['address'] = this.strAddress;
        this.strAddress = '';
        this.settings.setValue('destino', this.origen);
        this.destinoSeteado = true;
        this.origen = null;
        this.navCtrl.push('ListMasterPage');
      } else {
        console.log('Error al setear destino');
      }
    } else if (this.origenSeteado && this.destinoSeteado) {
      this.loading = this.loadingCtrl.create({
        content: 'Solo elige un carro'
      });
      this.loading.present();
      this.loading.dismiss();
      this.selectPoint = 'Carro';
      this.origen = null;
      this.navCtrl.push('ListMasterPage');
    }

  }


}




