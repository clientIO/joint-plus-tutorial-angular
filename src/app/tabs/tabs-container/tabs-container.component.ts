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
      this.tabComponents.get(this.tabGroup.selectedIndex)?.focus();
    }
  }

  onTabChange(evt: MatTabChangeEvent) {
    this.tabComponents.get(evt.index)?.focus();
    this.tabComponents.forEach((tab, i) => {
      if (i !== evt.index) {
        tab.blur();
      }
    });
  }

  onLinkClick(id: string) {
    const index = this.tabs.findIndex(tab => tab.id === id);
    if (index !== -1) {
      this.tabGroup.selectedIndex = index;
    }
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  addTab() {
    this.tabs.push({
      id: 'tab-' + this.tabs.length,
      title: 'Tab ' + this.tabs.length,
      graph: null
    });
    this.tabGroup.selectedIndex = this.tabs.length - 1;
  }
}
