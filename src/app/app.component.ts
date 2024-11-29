import { AfterViewInit, OnInit, Component, ElementRef, ViewChild } from '@angular/core';
import { linkTools, elementTools, dia, shapes, highlighters } from '@joint/plus';
import { Link, Message, FlowchartStart, FlowchartEnd } from '../shared/shapes';
import ResizeTool from '../shared/resize-tool';
import { AvoidRouter } from '../shared/avoid-router';

declare const window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef;

  private graph: dia.Graph;
  private paper: dia.Paper;

  public async ngOnInit(): Promise<any> {
    const cellNamespace = {
      ...shapes,
      app: {
        Link,
        Message,
        FlowchartStart,
        FlowchartEnd
      }
    };

    // Prepare the diagram.
    const graph = window.graph = this.graph = new dia.Graph({}, { cellNamespace });
    const paper = window.paper = this.paper = new dia.Paper({
      model: graph,
      cellViewNamespace: cellNamespace,
      width: 1000,
      height: 600,
      gridSize: 10,
      interactive: { linkMove: false },
      linkPinning: false,
      async: true,
      frozen: true,
      background: { color: '#F3F7F6' },
      snapLinks: { radius: 100 },
      overflow: true,
      defaultConnector: {
        name: 'straight',
        args: {
          cornerType: 'cubic',
          cornerRadius: 4,
        },
      },
      highlighting: {
        default: {
          name: 'mask',
          options: {
            padding: 2,
            attrs: {
              stroke: '#EA3C24',
              strokeWidth: 2,
            },
          },
        },
      },
      defaultLink: () => new Link(),
      validateConnection: (
        sourceView,
        sourceMagnet,
        targetView,
        targetMagnet,
        end
      ) => {
        const source = sourceView.model as dia.Element;
        const target = targetView.model as dia.Element;
        if (source.isLink() || target.isLink()) return false;
        if (targetMagnet === sourceMagnet) return false;
        if (end === 'target' ? targetMagnet : sourceMagnet) {
            return true;
        }
        if (source === target) return false;
        return end === 'target' ? !target.hasPorts() : !source.hasPorts();
      },
      validateMagnet: (cellView, magnet) => {
        // Do not create links from passive ports:
        if (magnet.getAttribute('magnet') === 'passive') return false;
        // Do not create links from ports which already have a connected links:
        const portId = ((magnet.parentElement as HTMLElement).getAttribute('port') as string);
        //const port = (cellView as dia.ElementView).findPortNode(portId);
        const portConnectedLinks = graph.getConnectedLinks(cellView.model).filter((link) => {
          if (link.source()?.port === portId) return true;
          return false;
        });
        if (portConnectedLinks.length === 0) return true;
        return false;
      },
    });

  // Add tools to the elements.
  graph.getElements().forEach((el) => addElementTools(el, paper));
  graph.on('add', (cell) => {
    if (cell.isLink()) return;
    addElementTools(cell, paper);
  });

  function addElementTools(el: dia.Element, paper: dia.Paper) {
    const tools = [
      new ResizeTool({
        selector: 'body',
      }),
      new elementTools.Remove({
        useModelGeometry: true,
        x: -10,
        y: -10,
      }),
    ];
    if (!el.hasPorts()) {
      tools.push(
        new elementTools.Connect({
          useModelGeometry: true,
          x: 'calc(w + 10)',
          y: 'calc(h - 20)',
        })
      );
    }

    el.findView(paper).addTools(new dia.ToolsView({ tools }));
  }

  // Add tools to the links.
  paper.on('link:mouseenter', (linkView) => {
    linkView.addTools(
      new dia.ToolsView({
        tools: [
          new linkTools.Remove(),
          new linkTools.TargetArrowhead(),
        ],
      })
    );
  });

  paper.on('link:mouseleave', (linkView) => {
    linkView.removeTools();
  });

  paper.on('blank:pointerdblclick', (evt, x, y) => {
    const node = new Message({
      position: { x: x - 50, y: y - 50 },
      size: { width: 100, height: 100 },
    });
    graph.addCell(node);
  });

  // Add a class to the links when they are being interacted with.
  // See `styles.css` for the styles.
  paper.on('link:pointerdown', (linkView) => {
    highlighters.addClass.add(linkView, 'line', 'active-link', {
      className: 'active-link'
    });
  });

  paper.on('link:pointerup', (linkView) => {
    highlighters.addClass.remove(linkView);
  });
  }

  public ngAfterViewInit(): void {
    const { canvas, graph, paper } = this;

    // Prepare the Avoid Router.
    const router = new AvoidRouter(graph, {
      shapeBufferDistance: 20,
      idealNudgingDistance: 10,
      portOverflow: 10,
    });
    router.addGraphListeners();

    // Import elements.
    router.disableListeners();
    graph.fromJSON({
      "cells": [
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "S100",
            "magnet": "portBody",
            "port": "POut100"
          },
          "target": {
            "id": "T0",
            "magnet": "portBody",
            "port": "PIn100"
          },
          "id": "L100",
          "z": 1,
          "attrs": {}
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn100"
              },
              {
                "group": "out",
                "id": "POut101"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 0
          },
          "id": "T0",
          "z": 2,
          "attrs": {
            "label": {
              "text": "Init"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn101"
              },
              {
                "group": "out",
                "id": "POut106"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 250
          },
          "id": "T139",
          "z": 3,
          "attrs": {
            "label": {
              "text": "Ven"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn106"
              },
              {
                "group": "out",
                "id": "POut102"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 500
          },
          "id": "T112",
          "z": 4,
          "attrs": {
            "label": {
              "text": "Schr"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 448,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn102"
              },
              {
                "group": "out",
                "id": "POut103"
              },
              {
                "group": "out",
                "id": "POut104"
              },
              {
                "group": "out",
                "id": "POut173"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 750
          },
          "id": "T113",
          "z": 5,
          "attrs": {
            "label": {
              "text": "Ver"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn103"
              },
              {
                "group": "out",
                "id": "POut105"
              }
            ]
          },
          "position": {
            "x": 106,
            "y": 1000
          },
          "id": "T134",
          "z": 6,
          "attrs": {
            "label": {
              "text": "Box"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn105"
              },
              {
                "group": "out",
                "id": "POut107"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 1250
          },
          "id": "T141",
          "z": 7,
          "attrs": {
            "label": {
              "text": "Vert"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn107"
              },
              {
                "group": "out",
                "id": "POut108"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 1500
          },
          "id": "T142",
          "z": 8,
          "attrs": {
            "label": {
              "text": "Dok"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn108"
              },
              {
                "group": "out",
                "id": "POut137"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 1750
          },
          "id": "T383",
          "z": 9,
          "attrs": {
            "label": {
              "text": "Ke"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn137"
              },
              {
                "group": "out",
                "id": "POut134"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 2000
          },
          "id": "T370",
          "z": 10,
          "attrs": {
            "label": {
              "text": "Info"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn134"
              },
              {
                "group": "out",
                "id": "POut135"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 2250
          },
          "id": "T371",
          "z": 11,
          "attrs": {
            "label": {
              "text": "Ep"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn104"
              },
              {
                "group": "out",
                "id": "POut136"
              }
            ]
          },
          "position": {
            "x": 600,
            "y": 1000
          },
          "id": "T373",
          "z": 12,
          "attrs": {
            "label": {
              "text": "Scu"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn109"
              },
              {
                "group": "in",
                "id": "PIn136"
              },
              {
                "group": "out",
                "id": "POut111"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 1250
          },
          "id": "T157",
          "z": 13,
          "attrs": {
            "label": {
              "text": "VerTest"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn111"
              },
              {
                "group": "out",
                "id": "POut112"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 1500
          },
          "id": "T158",
          "z": 14,
          "attrs": {
            "label": {
              "text": "V"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn112"
              },
              {
                "group": "out",
                "id": "POut113"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 1750
          },
          "id": "T191",
          "z": 15,
          "attrs": {
            "label": {
              "text": "Sc"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn113"
              },
              {
                "group": "out",
                "id": "POut142"
              },
              {
                "group": "out",
                "id": "POut143"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 2000
          },
          "id": "T402",
          "z": 16,
          "attrs": {
            "label": {
              "text": "Re"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn142"
              },
              {
                "group": "out",
                "id": "POut153"
              },
              {
                "group": "out",
                "id": "POut154"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 2250
          },
          "id": "T427",
          "z": 17,
          "attrs": {
            "label": {
              "text": "Ber"
            }
          }
        },
        {
          "type": "app.FlowchartStart",
          "size": {
            "width": 48,
            "height": 48
          },
          "ports": {
            "items": [
              {
                "group": "out",
                "id": "POut100"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": -160
          },
          "id": "S100",
          "z": 18,
          "attrs": {
            "label": {
              "text": "Start"
            },
            "data": {

            },
            "additional_info": {
              "text": ""
            },
            "workflowDetails": {
              "workflowName": "Stest",
              "workflowVersion": "4.39",
              "author": ""
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn153"
              },
              {
                "group": "out",
                "id": "POut155"
              },
              {
                "group": "out",
                "id": "POut156"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 2500
          },
          "id": "T440",
          "z": 18,
          "attrs": {
            "label": {
              "text": "Ve"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn155"
              },
              {
                "group": "out",
                "id": "POut149"
              },
              {
                "group": "out",
                "id": "POut150"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 2750
          },
          "id": "T422",
          "z": 19,
          "attrs": {
            "label": {
              "text": "GV"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn150"
              },
              {
                "group": "out",
                "id": "POut144"
              },
              {
                "group": "out",
                "id": "POut145"
              }
            ]
          },
          "position": {
            "x": 600,
            "y": 3000
          },
          "id": "T404",
          "z": 20,
          "attrs": {
            "label": {
              "text": "Ren"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn144"
              },
              {
                "group": "out",
                "id": "POut157"
              }
            ]
          },
          "position": {
            "x": 600,
            "y": 3250
          },
          "id": "T442",
          "z": 21,
          "attrs": {
            "label": {
              "text": "GV"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn156"
              },
              {
                "group": "out",
                "id": "POut147"
              },
              {
                "group": "out",
                "id": "POut148"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 2750
          },
          "id": "T421",
          "z": 22,
          "attrs": {
            "label": {
              "text": "G 3b"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn148"
              },
              {
                "group": "out",
                "id": "POut151"
              },
              {
                "group": "out",
                "id": "POut152"
              }
            ]
          },
          "position": {
            "x": 1094,
            "y": 3000
          },
          "id": "T425",
          "z": 23,
          "attrs": {
            "label": {
              "text": "R"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn151"
              },
              {
                "group": "out",
                "id": "POut158"
              }
            ]
          },
          "position": {
            "x": 1094,
            "y": 3250
          },
          "id": "T444",
          "z": 24,
          "attrs": {
            "label": {
              "text": "GV"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn143"
              },
              {
                "group": "in",
                "id": "PIn145"
              },
              {
                "group": "in",
                "id": "PIn147"
              },
              {
                "group": "in",
                "id": "PIn149"
              },
              {
                "group": "in",
                "id": "PIn152"
              },
              {
                "group": "in",
                "id": "PIn154"
              },
              {
                "group": "in",
                "id": "PIn157"
              },
              {
                "group": "in",
                "id": "PIn158"
              },
              {
                "group": "out",
                "id": "POut114"
              },
              {
                "group": "out",
                "id": "POut115"
              }
            ]
          },
          "position": {
            "x": 106,
            "y": 3000
          },
          "id": "T192",
          "z": 25,
          "attrs": {
            "label": {
              "text": "Za"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn114"
              },
              {
                "group": "out",
                "id": "POut116"
              }
            ]
          },
          "position": {
            "x": 106,
            "y": 3250
          },
          "id": "T194",
          "z": 26,
          "attrs": {
            "label": {
              "text": "Kontr"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn116"
              },
              {
                "group": "out",
                "id": "POut146"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 3500
          },
          "id": "T411",
          "z": 27,
          "attrs": {
            "label": {
              "text": "Buc"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 448,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn115"
              },
              {
                "group": "in",
                "id": "PIn146"
              },
              {
                "group": "out",
                "id": "POut117"
              },
              {
                "group": "out",
                "id": "POut118"
              },
              {
                "group": "out",
                "id": "POut119"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 3750
          },
          "id": "T325",
          "z": 28,
          "attrs": {
            "label": {
              "text": "Ahl"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn117"
              },
              {
                "group": "out",
                "id": "POut120"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 4000
          },
          "id": "T330",
          "z": 29,
          "attrs": {
            "label": {
              "text": "Scha"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn119"
              },
              {
                "group": "out",
                "id": "POut121"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 4000
          },
          "id": "T333",
          "z": 30,
          "attrs": {
            "label": {
              "text": "Um"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn118"
              },
              {
                "group": "in",
                "id": "PIn120"
              },
              {
                "group": "in",
                "id": "PIn121"
              },
              {
                "group": "out",
                "id": "POut160"
              },
              {
                "group": "out",
                "id": "POut161"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 4250
          },
          "id": "T446",
          "z": 31,
          "attrs": {
            "label": {
              "text": "ER"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn160"
              },
              {
                "group": "out",
                "id": "POut162"
              },
              {
                "group": "out",
                "id": "POut163"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 4500
          },
          "id": "T448",
          "z": 32,
          "attrs": {
            "label": {
              "text": "E"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn162"
              },
              {
                "group": "out",
                "id": "POut164"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 4750
          },
          "id": "T450",
          "z": 33,
          "attrs": {
            "label": {
              "text": "ES"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn164"
              },
              {
                "group": "out",
                "id": "POut165"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 5000
          },
          "id": "T451",
          "z": 34,
          "attrs": {
            "label": {
              "text": "Dru"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn161"
              },
              {
                "group": "in",
                "id": "PIn163"
              },
              {
                "group": "in",
                "id": "PIn165"
              },
              {
                "group": "in",
                "id": "PIn169"
              },
              {
                "group": "out",
                "id": "POut167"
              },
              {
                "group": "out",
                "id": "POut168"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 5250
          },
          "id": "T461",
          "z": 35,
          "attrs": {
            "label": {
              "text": "Che"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn167"
              },
              {
                "group": "out",
                "id": "POut169"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 5500
          },
          "id": "T462",
          "z": 36,
          "attrs": {
            "label": {
              "text": "Me"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn168"
              },
              {
                "group": "out",
                "id": "POut170"
              },
              {
                "group": "out",
                "id": "POut171"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 5500
          },
          "id": "T463",
          "z": 37,
          "attrs": {
            "label": {
              "text": "Mit"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn171"
              },
              {
                "group": "out",
                "id": "POut172"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 5750
          },
          "id": "T466",
          "z": 38,
          "attrs": {
            "label": {
              "text": "Pl"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn170"
              },
              {
                "group": "in",
                "id": "PIn172"
              },
              {
                "group": "out",
                "id": "POut138"
              },
              {
                "group": "out",
                "id": "POut139"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 5750
          },
          "id": "T396",
          "z": 39,
          "attrs": {
            "label": {
              "text": "Aut"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn138"
              },
              {
                "group": "out",
                "id": "POut140"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 6000
          },
          "id": "T398",
          "z": 40,
          "attrs": {
            "label": {
              "text": "A"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn139"
              },
              {
                "group": "out",
                "id": "POut141"
              }
            ]
          },
          "position": {
            "x": 797,
            "y": 6000
          },
          "id": "T401",
          "z": 41,
          "attrs": {
            "label": {
              "text": "Ma"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn140"
              },
              {
                "group": "in",
                "id": "PIn141"
              },
              {
                "group": "out",
                "id": "POut109"
              },
              {
                "group": "out",
                "id": "POut110"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 6250
          },
          "id": "T156",
          "z": 42,
          "attrs": {
            "label": {
              "text": "No"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 760,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn110"
              },
              {
                "group": "out",
                "id": "POut124"
              },
              {
                "group": "out",
                "id": "POut125"
              },
              {
                "group": "out",
                "id": "POut126"
              },
              {
                "group": "out",
                "id": "POut127"
              },
              {
                "group": "out",
                "id": "POut128"
              },
              {
                "group": "out",
                "id": "POut129"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 6500
          },
          "id": "T357",
          "z": 43,
          "attrs": {
            "label": {
              "text": "G"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn124"
              },
              {
                "group": "out",
                "id": "POut130"
              }
            ]
          },
          "position": {
            "x": -485,
            "y": 6750
          },
          "id": "T359",
          "z": 44,
          "attrs": {
            "label": {
              "text": "Da"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn125"
              },
              {
                "group": "out",
                "id": "POut131"
              }
            ]
          },
          "position": {
            "x": 9,
            "y": 6750
          },
          "id": "T361",
          "z": 45,
          "attrs": {
            "label": {
              "text": "Da"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn126"
              },
              {
                "group": "out",
                "id": "POut132"
              }
            ]
          },
          "position": {
            "x": 503,
            "y": 6750
          },
          "id": "T363",
          "z": 46,
          "attrs": {
            "label": {
              "text": "Da"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn127"
              },
              {
                "group": "out",
                "id": "POut133"
              }
            ]
          },
          "position": {
            "x": 997,
            "y": 6750
          },
          "id": "T369",
          "z": 47,
          "attrs": {
            "label": {
              "text": "D"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn128"
              },
              {
                "group": "out",
                "id": "POut159"
              }
            ]
          },
          "position": {
            "x": 1491,
            "y": 6750
          },
          "id": "T445",
          "z": 48,
          "attrs": {
            "label": {
              "text": "Ser"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn129"
              },
              {
                "group": "out",
                "id": "POut166"
              }
            ]
          },
          "position": {
            "x": 1985,
            "y": 6750
          },
          "id": "T454",
          "z": 49,
          "attrs": {
            "label": {
              "text": "P"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn130"
              },
              {
                "group": "in",
                "id": "PIn131"
              },
              {
                "group": "in",
                "id": "PIn132"
              },
              {
                "group": "in",
                "id": "PIn133"
              },
              {
                "group": "in",
                "id": "PIn159"
              },
              {
                "group": "in",
                "id": "PIn166"
              },
              {
                "group": "out",
                "id": "POut122"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 7000
          },
          "id": "T346",
          "z": 50,
          "attrs": {
            "label": {
              "text": "In"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn122"
              },
              {
                "group": "out",
                "id": "POut123"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 7250
          },
          "id": "T347",
          "z": 51,
          "attrs": {
            "label": {
              "text": "Ep"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn173"
              }
            ]
          },
          "position": {
            "x": 1094,
            "y": 1000
          },
          "id": "T1",
          "z": 52,
          "attrs": {
            "label": {
              "text": "Test1"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn123"
              }
            ]
          },
          "position": {
            "x": 500,
            "y": 7500
          },
          "id": "T467",
          "z": 53,
          "attrs": {
            "label": {
              "text": "end"
            }
          }
        },
        {
          "type": "app.Message",
          "size": {
            "width": 344,
            "height": 80
          },
          "ports": {
            "items": [
              {
                "group": "in",
                "id": "PIn135"
              }
            ]
          },
          "position": {
            "x": 303,
            "y": 2500
          },
          "id": "E10",
          "z": 54,
          "attrs": {
            "label": {
              "text": "Ende"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T0",
            "magnet": "portBody",
            "port": "POut101"
          },
          "target": {
            "id": "T139",
            "magnet": "portBody",
            "port": "PIn101"
          },
          "id": "1",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T112",
            "magnet": "portBody",
            "port": "POut102"
          },
          "target": {
            "id": "T113",
            "magnet": "portBody",
            "port": "PIn102"
          },
          "id": "2",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "u "
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T113",
            "magnet": "portBody",
            "port": "POut103"
          },
          "target": {
            "id": "T134",
            "magnet": "portBody",
            "port": "PIn103"
          },
          "id": "3",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "pp "
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T113",
            "magnet": "portBody",
            "port": "POut104"
          },
          "target": {
            "id": "T373",
            "magnet": "portBody",
            "port": "PIn104"
          },
          "id": "4",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T134",
            "magnet": "portBody",
            "port": "POut105"
          },
          "target": {
            "id": "T141",
            "magnet": "portBody",
            "port": "PIn105"
          },
          "id": "5",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T139",
            "magnet": "portBody",
            "port": "POut106"
          },
          "target": {
            "id": "T112",
            "magnet": "portBody",
            "port": "PIn106"
          },
          "id": "6",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T141",
            "magnet": "portBody",
            "port": "POut107"
          },
          "target": {
            "id": "T142",
            "magnet": "portBody",
            "port": "PIn107"
          },
          "id": "7",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T142",
            "magnet": "portBody",
            "port": "POut108"
          },
          "target": {
            "id": "T383",
            "magnet": "portBody",
            "port": "PIn108"
          },
          "id": "8",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "tt"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T156",
            "magnet": "portBody",
            "port": "POut109"
          },
          "target": {
            "id": "T157",
            "magnet": "portBody",
            "port": "PIn109"
          },
          "id": "9",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "yt"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T156",
            "magnet": "portBody",
            "port": "POut110"
          },
          "target": {
            "id": "T357",
            "magnet": "portBody",
            "port": "PIn110"
          },
          "id": "10",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T157",
            "magnet": "portBody",
            "port": "POut111"
          },
          "target": {
            "id": "T158",
            "magnet": "portBody",
            "port": "PIn111"
          },
          "id": "11",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T158",
            "magnet": "portBody",
            "port": "POut112"
          },
          "target": {
            "id": "T191",
            "magnet": "portBody",
            "port": "PIn112"
          },
          "id": "12",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T191",
            "magnet": "portBody",
            "port": "POut113"
          },
          "target": {
            "id": "T402",
            "magnet": "portBody",
            "port": "PIn113"
          },
          "id": "13",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "rrq"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T192",
            "magnet": "portBody",
            "port": "POut114"
          },
          "target": {
            "id": "T194",
            "magnet": "portBody",
            "port": "PIn114"
          },
          "id": "14",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "re"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T192",
            "magnet": "portBody",
            "port": "POut115"
          },
          "target": {
            "id": "T325",
            "magnet": "portBody",
            "port": "PIn115"
          },
          "id": "15",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T194",
            "magnet": "portBody",
            "port": "POut116"
          },
          "target": {
            "id": "T411",
            "magnet": "portBody",
            "port": "PIn116"
          },
          "id": "16",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "as"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T325",
            "magnet": "portBody",
            "port": "POut117"
          },
          "target": {
            "id": "T330",
            "magnet": "portBody",
            "port": "PIn117"
          },
          "id": "17",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "dw"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "cd"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T325",
            "magnet": "portBody",
            "port": "POut118"
          },
          "target": {
            "id": "T446",
            "magnet": "portBody",
            "port": "PIn118"
          },
          "id": "18",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "ww"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T325",
            "magnet": "portBody",
            "port": "POut119"
          },
          "target": {
            "id": "T333",
            "magnet": "portBody",
            "port": "PIn119"
          },
          "id": "19",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T330",
            "magnet": "portBody",
            "port": "POut120"
          },
          "target": {
            "id": "T446",
            "magnet": "portBody",
            "port": "PIn120"
          },
          "id": "20",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T333",
            "magnet": "portBody",
            "port": "POut121"
          },
          "target": {
            "id": "T446",
            "magnet": "portBody",
            "port": "PIn121"
          },
          "id": "21",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T346",
            "magnet": "portBody",
            "port": "POut122"
          },
          "target": {
            "id": "T347",
            "magnet": "portBody",
            "port": "PIn122"
          },
          "id": "22",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T347",
            "magnet": "portBody",
            "port": "POut123"
          },
          "target": {
            "id": "T467",
            "magnet": "portBody",
            "port": "PIn123"
          },
          "id": "23",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "qa"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T357",
            "magnet": "portBody",
            "port": "POut124"
          },
          "target": {
            "id": "T359",
            "magnet": "portBody",
            "port": "PIn124"
          },
          "id": "24",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "qsd"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "qasd"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T357",
            "magnet": "portBody",
            "port": "POut125"
          },
          "target": {
            "id": "T361",
            "magnet": "portBody",
            "port": "PIn125"
          },
          "id": "25",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "xc"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "bh"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T357",
            "magnet": "portBody",
            "port": "POut126"
          },
          "target": {
            "id": "T363",
            "magnet": "portBody",
            "port": "PIn126"
          },
          "id": "26",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "vf"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "qas"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T357",
            "magnet": "portBody",
            "port": "POut127"
          },
          "target": {
            "id": "T369",
            "magnet": "portBody",
            "port": "PIn127"
          },
          "id": "27",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "xc"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "qsd"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T357",
            "magnet": "portBody",
            "port": "POut128"
          },
          "target": {
            "id": "T445",
            "magnet": "portBody",
            "port": "PIn128"
          },
          "id": "28",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "cf"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T357",
            "magnet": "portBody",
            "port": "POut129"
          },
          "target": {
            "id": "T454",
            "magnet": "portBody",
            "port": "PIn129"
          },
          "id": "29",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T359",
            "magnet": "portBody",
            "port": "POut130"
          },
          "target": {
            "id": "T346",
            "magnet": "portBody",
            "port": "PIn130"
          },
          "id": "30",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T361",
            "magnet": "portBody",
            "port": "POut131"
          },
          "target": {
            "id": "T346",
            "magnet": "portBody",
            "port": "PIn131"
          },
          "id": "31",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T363",
            "magnet": "portBody",
            "port": "POut132"
          },
          "target": {
            "id": "T346",
            "magnet": "portBody",
            "port": "PIn132"
          },
          "id": "32",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T369",
            "magnet": "portBody",
            "port": "POut133"
          },
          "target": {
            "id": "T346",
            "magnet": "portBody",
            "port": "PIn133"
          },
          "id": "33",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T370",
            "magnet": "portBody",
            "port": "POut134"
          },
          "target": {
            "id": "T371",
            "magnet": "portBody",
            "port": "PIn134"
          },
          "id": "34",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T371",
            "magnet": "portBody",
            "port": "POut135"
          },
          "target": {
            "id": "E10",
            "magnet": "portBody",
            "port": "PIn135"
          },
          "id": "35",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T373",
            "magnet": "portBody",
            "port": "POut136"
          },
          "target": {
            "id": "T157",
            "magnet": "portBody",
            "port": "PIn136"
          },
          "id": "36",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T383",
            "magnet": "portBody",
            "port": "POut137"
          },
          "target": {
            "id": "T370",
            "magnet": "portBody",
            "port": "PIn137"
          },
          "id": "37",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "qxd"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T396",
            "magnet": "portBody",
            "port": "POut138"
          },
          "target": {
            "id": "T398",
            "magnet": "portBody",
            "port": "PIn138"
          },
          "id": "38",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "cgw"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T396",
            "magnet": "portBody",
            "port": "POut139"
          },
          "target": {
            "id": "T401",
            "magnet": "portBody",
            "port": "PIn139"
          },
          "id": "39",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T398",
            "magnet": "portBody",
            "port": "POut140"
          },
          "target": {
            "id": "T156",
            "magnet": "portBody",
            "port": "PIn140"
          },
          "id": "40",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T401",
            "magnet": "portBody",
            "port": "POut141"
          },
          "target": {
            "id": "T156",
            "magnet": "portBody",
            "port": "PIn141"
          },
          "id": "41",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "qxd"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T402",
            "magnet": "portBody",
            "port": "POut142"
          },
          "target": {
            "id": "T427",
            "magnet": "portBody",
            "port": "PIn142"
          },
          "id": "42",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "nj"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T402",
            "magnet": "portBody",
            "port": "POut143"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn143"
          },
          "id": "43",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "xde"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T404",
            "magnet": "portBody",
            "port": "POut144"
          },
          "target": {
            "id": "T442",
            "magnet": "portBody",
            "port": "PIn144"
          },
          "id": "44",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "as"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T404",
            "magnet": "portBody",
            "port": "POut145"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn145"
          },
          "id": "45",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T411",
            "magnet": "portBody",
            "port": "POut146"
          },
          "target": {
            "id": "T325",
            "magnet": "portBody",
            "port": "PIn146"
          },
          "id": "46",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "bq"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T421",
            "magnet": "portBody",
            "port": "POut147"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn147"
          },
          "id": "47",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "zq"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T421",
            "magnet": "portBody",
            "port": "POut148"
          },
          "target": {
            "id": "T425",
            "magnet": "portBody",
            "port": "PIn148"
          },
          "id": "48",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "zq"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T422",
            "magnet": "portBody",
            "port": "POut149"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn149"
          },
          "id": "49",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "zqw"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T422",
            "magnet": "portBody",
            "port": "POut150"
          },
          "target": {
            "id": "T404",
            "magnet": "portBody",
            "port": "PIn150"
          },
          "id": "50",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "zq"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T425",
            "magnet": "portBody",
            "port": "POut151"
          },
          "target": {
            "id": "T444",
            "magnet": "portBody",
            "port": "PIn151"
          },
          "id": "51",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "vre"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T425",
            "magnet": "portBody",
            "port": "POut152"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn152"
          },
          "id": "52",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "9"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T427",
            "magnet": "portBody",
            "port": "POut153"
          },
          "target": {
            "id": "T440",
            "magnet": "portBody",
            "port": "PIn153"
          },
          "id": "53",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "xq"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T427",
            "magnet": "portBody",
            "port": "POut154"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn154"
          },
          "id": "54",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "zx"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T440",
            "magnet": "portBody",
            "port": "POut155"
          },
          "target": {
            "id": "T422",
            "magnet": "portBody",
            "port": "PIn155"
          },
          "id": "55",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "xcf"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T440",
            "magnet": "portBody",
            "port": "POut156"
          },
          "target": {
            "id": "T421",
            "magnet": "portBody",
            "port": "PIn156"
          },
          "id": "56",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T442",
            "magnet": "portBody",
            "port": "POut157"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn157"
          },
          "id": "57",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T444",
            "magnet": "portBody",
            "port": "POut158"
          },
          "target": {
            "id": "T192",
            "magnet": "portBody",
            "port": "PIn158"
          },
          "id": "58",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T445",
            "magnet": "portBody",
            "port": "POut159"
          },
          "target": {
            "id": "T346",
            "magnet": "portBody",
            "port": "PIn159"
          },
          "id": "59",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "[esr]='1'"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T446",
            "magnet": "portBody",
            "port": "POut160"
          },
          "target": {
            "id": "T448",
            "magnet": "portBody",
            "port": "PIn160"
          },
          "id": "60",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "bg"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T446",
            "magnet": "portBody",
            "port": "POut161"
          },
          "target": {
            "id": "T461",
            "magnet": "portBody",
            "port": "PIn161"
          },
          "id": "61",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "aq"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T448",
            "magnet": "portBody",
            "port": "POut162"
          },
          "target": {
            "id": "T450",
            "magnet": "portBody",
            "port": "PIn162"
          },
          "id": "62",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "vg"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T448",
            "magnet": "portBody",
            "port": "POut163"
          },
          "target": {
            "id": "T461",
            "magnet": "portBody",
            "port": "PIn163"
          },
          "id": "63",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T450",
            "magnet": "portBody",
            "port": "POut164"
          },
          "target": {
            "id": "T451",
            "magnet": "portBody",
            "port": "PIn164"
          },
          "id": "64",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T451",
            "magnet": "portBody",
            "port": "POut165"
          },
          "target": {
            "id": "T461",
            "magnet": "portBody",
            "port": "PIn165"
          },
          "id": "65",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T454",
            "magnet": "portBody",
            "port": "POut166"
          },
          "target": {
            "id": "T346",
            "magnet": "portBody",
            "port": "PIn166"
          },
          "id": "66",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "xxas"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T461",
            "magnet": "portBody",
            "port": "POut167"
          },
          "target": {
            "id": "T462",
            "magnet": "portBody",
            "port": "PIn167"
          },
          "id": "67",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "qsd"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T461",
            "magnet": "portBody",
            "port": "POut168"
          },
          "target": {
            "id": "T463",
            "magnet": "portBody",
            "port": "PIn168"
          },
          "id": "68",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T462",
            "magnet": "portBody",
            "port": "POut169"
          },
          "target": {
            "id": "T461",
            "magnet": "portBody",
            "port": "PIn169"
          },
          "id": "69",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": "xsw"
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T463",
            "magnet": "portBody",
            "port": "POut170"
          },
          "target": {
            "id": "T396",
            "magnet": "portBody",
            "port": "PIn170"
          },
          "id": "70",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "ax"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T463",
            "magnet": "portBody",
            "port": "POut171"
          },
          "target": {
            "id": "T466",
            "magnet": "portBody",
            "port": "PIn171"
          },
          "id": "71",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T466",
            "magnet": "portBody",
            "port": "POut172"
          },
          "target": {
            "id": "T396",
            "magnet": "portBody",
            "port": "PIn172"
          },
          "id": "72",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        },
        {
          "type": "app.Link",
          "labels": [
            {
              "attrs": {
                "labelText": {
                  "text": ""
                }
              },
              "position": {
                "distance": 0.25
              }
            }
          ],
          "source": {
            "id": "T113",
            "magnet": "portBody",
            "port": "POut173"
          },
          "target": {
            "id": "T1",
            "magnet": "portBody",
            "port": "PIn173"
          },
          "id": "L101",
          "z": 54,
          "attrs": {
            "condition": {
              "conditionDetails": "Empty"
            }
          }
        }
      ]
    });
    graph.getElements().forEach(element => {
      const [firstInPort] = element.getGroupPorts('in');
      const linksToFix = graph.getConnectedLinks(element, { inbound: true }).filter(link => link.target().port !== firstInPort.id);
      linksToFix.forEach(link => {
        const oldTarget = link.target();
        const newTarget = Object.assign({}, oldTarget, { port: firstInPort.id });
        link.target(newTarget);
      });
    });

    // Finalize preparation of the paper.
    canvas.nativeElement.appendChild(paper.el);
    paper.unfreeze();
    paper.fitToContent({
      useModelGeometry: true,
      padding: 100,
      allowNewOrigin: 'any',
    });

    // Enable the Avoid Router.
    router.routeAll();
    router.enableListeners();
  }
}
