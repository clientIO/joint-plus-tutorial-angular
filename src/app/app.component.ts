import { AfterViewInit, OnInit, Component, ElementRef, ViewChild } from '@angular/core';
import { dia, ui, shapes } from '@clientio/rappid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef;

  private graph: dia.Graph;
  private paper: dia.Paper;
  private scroller: ui.PaperScroller;

  public ngOnInit(): void {
    const graph = this.graph = new dia.Graph({}, { cellNamespace: shapes });

    const paper = this.paper = new dia.Paper({
        model: graph,
        background: {
            color: '#F8F9FA',
        },
        frozen: true,
        async: true,
        cellViewNamespace: shapes
    });
    
    const scroller = this.scroller = new ui.PaperScroller({
        paper,
        autoResizePaper: true,
        cursor: 'grab'
    });

    scroller.render();

    const rect = new shapes.standard.Rectangle({
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
        attrs: {
            label: {
                text: 'Hello World'
            }
        }
    });

    this.graph.addCell(rect);
  }

  public ngAfterViewInit(): void {
    const { scroller, paper, canvas } = this;
    canvas.nativeElement.appendChild(this.scroller.el);
    scroller.center();
    paper.unfreeze();
  }
}
