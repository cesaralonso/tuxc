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
import { App, IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  map: GoogleMap;
  loading: any;
  loading_wait: any;

  posicion: ILatLng;
  _origen: ILatLng;
  _destino: ILatLng;
  dataStorage: any = {};

  located: boolean = false;
  elegirDestino: boolean = false;
  destinoElegido: boolean = false;

  origenSeteado: boolean = false;
  destinoSeteado: boolean = false;

  selectPoint: string = 'Origen';
  estado: string = 'Inicia';

  _strAddressDestino: any = '';
  _strAddressOrigen: any = '';


  @ViewChild('address', { read: ElementRef}) 
  address: ElementRef;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private settings: Settings,
    public appCtrl: App) {
    
      this.estado = 'Selecciona';
      
      // Para controlar los estados cuando viene desde otra pantalla
      if (this.navParams.get('estado')) {
        this.estado = this.navParams.get('estado');

        // Estado cuando usuario ha iniciado el viaje
        if (this.estado === 'HaciaOrigen') {
          this.selectPoint = 'Carro en camino hacia ti';
        }
        console.log('estado', this.estado);
      }
  }

  ionViewDidLoad() {
    this.loading_wait = this.loadingCtrl.create({
      content: 'Por favor espera...'
    })
  }

  ionViewDidEnter() {
    this.loadMap();
  }

  loadMap() {
    let mapOptions: GoogleMapOptions = {
      'controls': {
        'compass': false,
        'myLocationButton': false,
        'myLocation': true,
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

  // Posiciona la posición de origen
  onFindLocation(e) {
    // Limpia Mapa
    this.map.clear();

    // Get the location of you
    this.map.getMyLocation()
      .then((location: MyLocation) => {

        /**
         * location tiene: 
         * {
         * "latLng":
         * {
         * "lat":19.6989371,
         * "lng":-103.4797342},
         * "elapsedRealtimeNanos":152568973411755,
         * "time":1539296923000,
         * "accuracy":40.659000396728516,
         * "altitude":1511,
         * "speed":0,
         * "provider":"fused",
         * "hashCode":203174665,
         * "status":true
         * }
         */

        // Move the map camera to the location with animation
        this.map.animateCamera({
          target: location.latLng,
          zoom: 17,
          tilt: 30,
          bearing: 140,
          duration: 500
        })
        .then(() => {

          // Obtiene la información de una posición (calle, localidad, estado, etc..)
          Geocoder.geocode({
              "position": location.latLng
            })
            .then((results: GeocoderResult[]) => {

              if (results.length == 0) {
                // Not found
                return null;
              }

              // Cadena con la dirección completa de origen
              let strAddress = [
                results[0].subThoroughfare || "",
                results[0].thoroughfare || "",
                results[0].locality || "",
                results[0].adminArea || "",
                results[0].postalCode || "",
                results[0].country || ""].join(", ");

              // Paso la dirección a una copia por que despues de volverá a setear strAddress
              this._strAddressOrigen = strAddress;

              // origen es establecido con la posición (coordenada)
              this.posicion = location.latLng;

              // latLng origen para Polyline
              this._origen =  location.latLng;

              // add a marker
              let marker: Marker = this.map.addMarkerSync({
                title: 'Tu te encuentras aquí',
                snippet: this._strAddressOrigen,
                position: this.posicion,
                animation: GoogleMapsAnimation.BOUNCE
              });

              // show the infoWindow
              marker.showInfoWindow();
              this.located = true;

              // If clicked it, display the alert
              marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
                this.showToast('Esta es tu ubicación de origen');
              });
            });
        });
      });
  }

  // Establece una dirección de destino despues de haber ya posicionado un origen
  onEstablishAddress(event) {
    // Presenta loading
    this.loading_wait.present();
    // Limpia Mapa
    this.map.clear();

    // Address -> latitude, longitude
    // Toma el valor del input de la vista para sacar la información de la dirección
    Geocoder.geocode({
      "address": this.address.nativeElement.value
    })
    .then((results: GeocoderResult[]) => {

      if (results.length == 0) {
        // Not found
        return null;
      }

      // Cierra el loading
      this.loading_wait.dismiss();

      // latLng destino para Polyline
      this._destino = results[0].position;

      // Cadena con la dirección completa de destino
      this._strAddressDestino = [
        results[0].subThoroughfare || "",
        results[0].thoroughfare || "",
        results[0].locality || "",
        results[0].adminArea || "",
        results[0].postalCode || "",
        results[0].country || ""].join(", ");

      // POLYLINE solo de prueba por ahora, no se incluirá en la aplicación como tal si no un trazado de rutas, pero para una segunda versión
      const ORIGEN = {'lat': this._origen.lat, 'lng': this._origen.lng};
      const DESTINO =  {'lat': this._destino.lat, 'lng': this._destino.lng};
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
          snippet: this._strAddressDestino,
          animation: GoogleMapsAnimation.BOUNCE
        });
        marker.showInfoWindow();
      });


      // Se guarda la posición
      this.posicion = results[0].position;

      // Para quitar de la vista el search input
      this.destinoElegido = true;
    });
  }

  setUbicacion() {
    // Limpia Mapa
    this.map.clear();

    if (!this.origenSeteado) {

      // Origen
      this.showToast('Ahora elige el destino');

      this.selectPoint = 'Destino';
      this.elegirDestino = true;

      if (this.posicion !== undefined) {
        this.posicion['address'] = this._strAddressOrigen;
        this._strAddressOrigen = '';
        
        // Guarda en LocalStorage
        this.settings.setValue('origen', this.posicion);

        this.origenSeteado = true;
        this.posicion = null;
      } else {
        console.log('Error al setear origen');
      }

    } else if (this.origenSeteado && !this.destinoSeteado) {

      // Destino
      this.showToast('Origen y destino seleccionados');

      this.selectPoint = 'Carro';

      if (this.posicion !== undefined) {
        this.posicion['address'] = this._strAddressDestino;
        this._strAddressDestino = '';

        // Guarda en LocalStorage
        this.settings.setValue('destino', this.posicion);

        this.destinoSeteado = true;
        this.posicion = null;

        // Seteado Origen y Destino envía a pantalla de Selección de EligeCarroPage
        // Aqui es el momento para iniciar comunicacion usuario - chofer.
        // Pasar a vista DriverDetailPage como una página root
        this.appCtrl.getRootNav().setRoot('DriverDetailPage');

      } else {
        console.log('Error al setear destino');
      }
    }
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top'
    });
    toast.present(toast);
  }

}




