import { MapPage } from './../map/map';
import { Settings } from './../../providers/settings/settings';
import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
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
  ILatLng
} from '@ionic-native/google-maps';


@IonicPage()
@Component({
  selector: 'page-viaje',
  templateUrl: 'viaje.html',
})
export class ViajePage {

  map: GoogleMap;
  loading_wait: any;

  storageOrigen: ILatLng;
  storageDestino: ILatLng;
  storageCarro: ILatLng;

  condName: string;
  condPic: string;
  condAbout: string;

  origLat: string;
  origLng: string;
  origAddress: string;

  destLat: string;
  destLng: string;
  destAddress: string;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private settings: Settings,
      public appCtrl: App
  ) {
  }


  ionViewDidLoad() {
    this.loading_wait = this.loadingCtrl.create({
      content: 'Por favor espera...'
    });

    this.settings.load().then(() => {

      // Obtengo del Localstorage los settings
      console.log('storage allSettings', this.settings.allSettings);

      let allSettings = this.settings.allSettings;
      this.storageOrigen = allSettings.origen;
      this.storageDestino = allSettings.destino;
      this.storageCarro = allSettings.carro;

      this.condName = allSettings.carro.name;
      this.condPic = allSettings.carro.profilePic;
      this.condAbout = allSettings.carro.about;

      this.origAddress = allSettings.origen.address;
      this.destAddress = allSettings.destino.address;
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

  goTo(page: string) {
    this.navCtrl.push(page);
  }

  iniciarViaje() {
    let toast = this.toastCtrl.create({
      message: 'Tu viaje ha comenzado, espera la llegada del carro a tu ubicación origen',
      duration: 4000,
      position: 'top'
    });

    toast.present(toast);
    toast.dismiss();

    // Envía a mapa con un estado HaciaOrigen para detectar este paso
   this.appCtrl.getRootNav().setRoot('MapPage', {'estado': 'HaciaOrigen'});
  }

}
