import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { TabComponent } from '../tab/tab.component';
import { TabsDataService } from '../tabs-data.service';
import { Tab } from '../tabs.models';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss']
})
export class TabsContainerComponent implements OnInit, AfterViewInit {
  tabs: Tab[];
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChildren('tab') tabComponents: QueryList<TabComponent>;

  constructor(private tabsDataService: TabsDataService) {
    this.tabs = this.tabsDataService.getTabs();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.tabGroup.selectedIndex !== null) {
      this.tabComponents.get(this.tabGroup.selectedIndex)?.setFocus();
    }
  }

  onTabChange(evt: MatTabChangeEvent) {
    this.tabComponents.get(evt.index)?.setFocus();
  }

  onLinkClick(id: string) {
    const index = this.tabs.findIndex(tab => tab.id === id);
    if (index) {
      this.tabGroup.selectedIndex = index;
    }
  }
}
