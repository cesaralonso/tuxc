import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { DriverDetailPage } from './driver-detail';

@NgModule({
  declarations: [
    DriverDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(DriverDetailPage),
    TranslateModule.forChild()
  ],
  exports: [
    DriverDetailPage
  ]
})
export class DriverDetailPageModule { }
