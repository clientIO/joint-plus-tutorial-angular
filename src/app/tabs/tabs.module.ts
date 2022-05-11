import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

import { TabsRoutingModule } from './tabs-routing.module';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { TabComponent } from './tab/tab.component';


@NgModule({
  declarations: [
    TabsContainerComponent,
    TabComponent
  ],
  imports: [
    CommonModule,
    TabsRoutingModule,
    MatTabsModule
  ]
})
export class TabsModule { }
