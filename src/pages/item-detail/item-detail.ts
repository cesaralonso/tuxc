import { Settings } from './../../providers/settings/settings';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { Items } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    items: Items,
    private settings: Settings,
    public loadingCtrl: LoadingController) {

    this.presentLoading();
    this.item = navParams.get('item') || items.defaultItem;
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Espere a que un chofer acepte el viaje...",
      duration: 3000
    });
    loader.present();
  }

  setCarro(item: any) {
    this.settings.setValue('carro', item);
    this.navCtrl.push('ViajePage');
  }

}
