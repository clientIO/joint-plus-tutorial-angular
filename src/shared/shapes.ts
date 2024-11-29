// @ts-nocheck
import { dia, shapes, g, util } from '@joint/plus';

const MAX_PORT_COUNT = 10;
const FONT_FAMILY = 'sans-serif';
const OUT_PORT_HEIGHT = 10;
const OUT_PORT_WIDTH = 10;
const OUT_PORT_LABEL = 'O';
const PORT_BORDER_RADIUS = 5;
const PADDING_L = 5;
const PADDING_S = 5;
const ADD_PORT_SIZE = 20;
const REMOVE_PORT_SIZE = 20;
const BACKGROUND_COLOR = 'white';
const LIGHT_COLOR = 'lightgray';
const DARK_COLOR = 'black';
const MAIN_COLOR = 'gray';
const LINE_WIDTH = 1;

export enum ShapeTypesEnum {
    BASE = "app.Base",
    MESSAGE = "app.Message",
    FLOWCHART_START = "app.FlowchartStart",
    FLOWCHART_END = "app.FlowchartEnd",
    LINK = "app.Link",
  }

  export let OutportsData: { id: any; width: any }[] = [];

  export function resetOutportsData() {
    OutportsData = [];
  }

  const outputPortPosition = (
    portsArgs: dia.Element.Port[],
    elBBox: dia.BBox
  ): g.Point[] => {
    const step = OUT_PORT_WIDTH + PADDING_S;
    return portsArgs.map(
      (port: dia.Element.Port, index: number) =>
        new g.Point({
          x: PADDING_L + OUT_PORT_WIDTH / 2 + index * step,
          y: elBBox.height,
        })
    );
  };
  let L_COUNT = 100;
  let A_COUNT = 0;
  let S_COUNT = 100;
  let PORT_COUNT = 100;
  let counter = 0;

  const Base = dia.Element.define(
    ShapeTypesEnum.BASE,
    {
      // no default attributes
    },
    {
      getBoundaryPadding: function () {
        return util.normalizeSides(this.boundaryPadding);
      },

      toJSON: function () {
        // Simplify the element resulting JSON
        const json = dia.Element.prototype.toJSON.call(this);
        // Remove port groups and angle for better readability
        delete json.ports.groups;
        delete json.angle;
        return json;
      }
    },
    {
      fromStencilShape: function(element: dia.Element, id?: string) {
        const attrs = {
            label: {
                text: element.attr(['label', 'text'])
            },
            body: {
                stroke: element.attr(['body', 'stroke']),
                fill: element.attr(['body', 'fill'])
            },
            icon: {
                xlinkHref: element.attr(['icon', 'xlinkHref'])
            }
        };
        return new this({ id, attrs });
    }
    }
  );

  export const Message = Base.define(
    ShapeTypesEnum.MESSAGE,
    {
      size: { width: 368, height: 80 },
      ports: {
        groups: {
          in: {
            position: {
              name: "manual",
              args: {
                x: PADDING_L,
                y: 0,
              },
            },
            size: {
              width: 16,
              height: 16,
            },
            attrs: {
              portBody: {
                magnet: "passive",
                width: "calc(w)",
                height: "calc(h)",
                y: "calc(-0.5 * h)",
                rx: PORT_BORDER_RADIUS,
                ry: PORT_BORDER_RADIUS,
                fill: LIGHT_COLOR,
                stroke: DARK_COLOR,
                strokeWidth: LINE_WIDTH,
              },
            },
            markup: [
              {
                tagName: "rect",
                selector: "portBody",
              },
            ],
          },
          out: {
            position: outputPortPosition,
            size: {
              width: OUT_PORT_WIDTH,
              height: OUT_PORT_HEIGHT,
            },
            attrs: {
              portBody: {
                magnet: "active",
                width: "calc(w)",
                height: "calc(h)",
                x: "calc(-0.5 * w)",
                y: "calc(-0.5 * h)",
                fill: DARK_COLOR,
                ry: PORT_BORDER_RADIUS,
                rx: PORT_BORDER_RADIUS,
              },
              portLabel: {
                pointerEvents: "none",
                fontFamily: FONT_FAMILY,
                fontWeight: 400,
                fontSize: 13,
                fill: LIGHT_COLOR,
                textAnchor: "start",
                textVerticalAnchor: "middle",
                textWrap: {
                  width: -REMOVE_PORT_SIZE - PADDING_L - PADDING_S,
                  maxLineCount: 1,
                  ellipsis: true,
                },
                x: PADDING_L - OUT_PORT_WIDTH / 2,
              },
              portRemoveButton: {
                cursor: "pointer",
                event: "element:port:remove",
                transform: `translate(calc(0.5 * w - ${PADDING_L}), 0)`,
                dataTooltip: "Remove Output Port",
                dataTooltipPosition: "top",
              },
              // portRemoveButtonBody: {
              //   width: REMOVE_PORT_SIZE,
              //   height: REMOVE_PORT_SIZE,
              //   x: -REMOVE_PORT_SIZE / 2,
              //   y: -REMOVE_PORT_SIZE / 2,
              //   fill: LIGHT_COLOR,
              //   rx: PORT_BORDER_RADIUS,
              //   ry: PORT_BORDER_RADIUS,
              // },
              // portRemoveButtonIcon: {
              //   d: "M -4 -4 4 4 M -4 4 4 -4",
              //   stroke: DARK_COLOR,
              //   strokeWidth: LINE_WIDTH,
              // },
            },
            markup: [
              {
                tagName: "rect",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
              {
                tagName: "g",
                selector: "portRemoveButton",
                children: [
                  {
                    tagName: "rect",
                    selector: "portRemoveButtonBody",
                  },
                  {
                    tagName: "path",
                    selector: "portRemoveButtonIcon",
                  },
                ],
              },
            ],
          },
        },
        items: [
          {
            group: "in"
          },
          {
            group: "out",
            attrs: { portLabel: { text: OUT_PORT_LABEL } },
          },
        ],
      },
      attrs: {

        body: {
          width: "calc(w)",
          height: "calc(h)",
          fill: LIGHT_COLOR,
          strokeWidth: LINE_WIDTH / 2,
          stroke: "#333333",
          rx: 3,
          ry: 3,
        },
        label: {
          x: 54,
          y: PADDING_L,
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 16,
          fill: "#322A49",
          text: "Label",
          textWrap: {
            width: -54 - PADDING_L,
            maxLineCount: 1,
            ellipsis: true,
          },
          textVerticalAnchor: "top",
        },

        label2: {
          x: 54,
          y: PADDING_L,
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 16,
          fill: "#322A49",
          text: "labello2",
          textWrap: {
            width: -54 - PADDING_L,
            maxLineCount: 1,
            ellipsis: true,
          },
          textVerticalAnchor: "top",
        },

        selectedInpin: {
          fontFamily: FONT_FAMILY,
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 13,
          fill: "#655E77",
          textVerticalAnchor: "top",
          text: "selectedInpin",
          textWrap: {
            width: -54 - PADDING_L,
            maxLineCount: 2,
            ellipsis: true,
          },
        },
        selectedOutpin: {
          fontFamily: FONT_FAMILY,
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 13,
          fill: "#655E77",
          textVerticalAnchor: "top",
          text: "selectedOutpin",
          textWrap: {
            width: -54 - PADDING_L,
            maxLineCount: 2,
            ellipsis: true,
          },
        },
        inpinValue1: {
          fontFamily: FONT_FAMILY,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 13,
          fill: "#655E77",
          textVerticalAnchor: "top",
          text: "rrrtt",
          textWrap: {
            width: -54 - PADDING_L,
            maxLineCount: 2,
            ellipsis: true,
          },
        },
        outpinValue: {
          fontFamily: FONT_FAMILY,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 13,
          fill: "#655E77",
          textVerticalAnchor: "top",
          text: "outpinValue",
          textWrap: {
            width: -54 - PADDING_L,
            maxLineCount: 2,
            ellipsis: true,
          },
        },
        icon: {
          width: 20,
          height: 20,
          x: PADDING_L,
          y: 24,
          xlinkHref: "https://image.flaticon.com/icons/svg/151/151795.svg",
        },
        portAddButton: {
          cursor: "pointer",
          fill: MAIN_COLOR,
          event: "element:port:add",
          transform: "translate(calc(w - 28), calc(h))",
          dataTooltip: "Add Output Port",
          dataTooltipPosition: "top",
        },
        portAddButtonBody: {
          width: ADD_PORT_SIZE,
          height: ADD_PORT_SIZE,
          rx: PORT_BORDER_RADIUS,
          ry: PORT_BORDER_RADIUS,
          x: -ADD_PORT_SIZE / 2,
          y: -ADD_PORT_SIZE / 2,
        },
        portAddButtonIcon: {
          d: "M -4 0 4 0 M 0 -4 0 4",
          stroke: "#FFFFFF",
          strokeWidth: LINE_WIDTH,
        },
      },
    },
    {
      markup: [
        {
          tagName: "rect",
          selector: "body",
        },
        {
          tagName: "text",
          selector: "label",
        },

        {
          tagName: "image",
          selector: "icon",
        },
        {
          tagName: "g",
          selector: "portAddButton",
          children: [
            {
              tagName: "rect",
              selector: "portAddButtonBody",
            },
            {
              tagName: "path",
              selector: "portAddButtonIcon",
            },
          ],
        },
      ],
      // old code starts
      // generateId: function () {
      //   const prefix = "T";
      //   const count = A_COUNT;
      //   A_COUNT += 1;

      //   return prefix + "" + count;
      // },
      // generatePortId: function(){
      //     let portcount = PORT_COUNT;
      //     PORT_COUNT += 1;
      //      return "PORT" + portcount;
      // },
      // old code ends

      boundaryPadding: {
        horizontal: PADDING_L,
        top: PADDING_L,
        bottom: OUT_PORT_HEIGHT / 2 + PADDING_L,
      },

       // @roman
       initialize() {
        Base.prototype.initialize.apply(this, arguments);
        this.on('change:ports', (cell: dia.Cell, ports: any, opt: any) => this.onPortsChange(opt));
        this.onPortsChange();
    },
     generateId: function () {
        const missingIDs = [];//sharedService.getMissingIDs();
        /*if (missingIDs.length > 0) {
          // Take the first missing ID and remove it from the list
          const idToReturn = missingIDs[0];
          missingIDs.shift();
          sharedService.setMissingIDs(missingIDs);
          return idToReturn;
        }*/
        const prefix = "T";
        const count = A_COUNT;
        A_COUNT += 1;
        return prefix + "" + count;
      },

    // generateId() {
    //     return `T${counter++}`;
    // },

    generatePortId: function() {
        return util.uuid();
    },

    // @roman
    onPortsChange(opt?: any) {

        const outports = this.getPorts().filter((port: any) => port.group === "out");
        const actiID = this.id;
        const count = Math.max(3, outports.length + 1);
        const width = PADDING_L + count * (OUT_PORT_WIDTH + PADDING_S) + PADDING_L;
        const currentWidth = this.prop('size/width');
        this.prop('size/width', Math.max(width, currentWidth), opt);
        OutportsData.push({ id: actiID, width });
       // console.log('OutportsData',OutportsData)
    },


      addDefaultPort: function () {
        if (!this.canAddPort("out")) return;
        this.addPort({
          group: "out",
          attrs: { portLabel: { text: OUT_PORT_LABEL } },
        });
      },

      canAddPort: function (group: string): boolean {
        return Object.keys(this.getGroupPorts(group)).length < MAX_PORT_COUNT;
      },

      toggleAddPortButton: function (group: string): void {
        const buttonAttributes = this.canAddPort(group)
          ? { fill: MAIN_COLOR, cursor: "pointer" }
          : { fill: "#BEBEBE", cursor: "not-allowed" };
        this.attr(["portAddButton"], buttonAttributes, {
          dry: true /* to be ignored by the Command Manager */,
        });
      },
    }
  );

  export const FlowchartStart = Base.define(
    ShapeTypesEnum.FLOWCHART_START,
    {
      size: { width: 48, height: 48 },
      ports: {
        groups: {
          out: {
            position: { name: "bottom" },
            attrs: {
              portBody: {
                fill: DARK_COLOR,
                stroke: BACKGROUND_COLOR,
                strokeWidth: 6,
                paintOrder: "stroke",
                magnet: "active",
                r: "calc(0.5 * d)",
              },
            },
            size: { width: 10, height: 10 },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
            ],
          },
        },
        items: [{ group: "out" }],
      },
      attrs: {
        body: {
          fill: MAIN_COLOR,
          stroke: "none",
          cx: "calc(0.5 * w)",
          cy: "calc(0.5 * h)",
          r: 24,
        },
        icon: {
          d: "M 2 8 L 4.29 5.71 L 1.41 2.83 L 2.83 1.41 L 5.71 4.29 L 8 2 L 8 8 Z M -2 8 L -8 8 L -8 2 L -5.71 4.29 L -1 -0.41 L -1 -8 L 1 -8 L 1 0.41 L -4.29 5.71 Z",
          fill: LIGHT_COLOR,
          transform: "translate(calc(0.5 * w), calc(0.5 * h))",
        },
        label: {
          text: "Flowchart start",
          textWrap: {
            width: 200,
            height: 100,
            ellipsis: true,
          },
          x: "calc(0.5 * w)",
          y: -PADDING_L,
          textAnchor: "middle",
          textVerticalAnchor: "bottom",
          fill: "#55627B",
          fontFamily: FONT_FAMILY,
          fontSize: 13,
        },
      },
    },
    {
      markup: [
        {
          tagName: "circle",
          selector: "body",
        },
        {
          tagName: "path",
          selector: "icon",
        },
        {
          tagName: "text",
          selector: "label",
        },
      ],
      generateId: function () {
        const prefix = "S";
        const count = S_COUNT;
        S_COUNT += 1;
        return prefix + "" + count;
      },
      boundaryPadding: {
        horizontal: PADDING_L,
        top: PADDING_S,
        bottom: PADDING_L,
      },
    }
  );

  export const FlowchartEnd = Base.define(
    ShapeTypesEnum.FLOWCHART_END,
    {
      size: { width: 48, height: 48 },
      ports: {
        groups: {
          in: {
            position: { name: "top" },
            attrs: {
              portBody: {
                fill: DARK_COLOR,
                stroke: BACKGROUND_COLOR,
                strokeWidth: 6,
                paintOrder: "stroke",
                magnet: "passive",
                r: "calc(0.5 * d)",
              },
            },
            size: { width: 10, height: 10 },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
            ],
          },
        },
        items: [{ group: "in" }],
      },
      attrs: {
        body: {
          fill: MAIN_COLOR,
          stroke: "none",
          cx: "calc(0.5 * w)",
          cy: "calc(0.5 * h)",
          r: 24,
        },
        icon: {
          d: "M 5 -8.45 L 6.41 -7.04 L 3 -3.635 L 1.59 -5.04 Z M -4.5 3.95 L -1 3.95 L -1 -1.63 L -6.41 -7.04 L -5 -8.45 L 1 -2.45 L 1 3.95 L 4.5 3.95 L 0 8.45 Z",
          fill: LIGHT_COLOR,
          transform: "translate(calc(0.5 * w), calc(0.5 * h))",
        },
        label: {
          text: "Flowchart end",
          textWrap: {
            width: 200,
            height: 100,
            ellipsis: true,
          },
          x: "calc(0.5 * w)",
          y: `calc(h + ${PADDING_L})`,
          textAnchor: "middle",
          textVerticalAnchor: "top",
          fill: "#55627B",
          fontFamily: FONT_FAMILY,
          fontSize: 13,
        },
      },
    },
    {
      markup: [
        {
          tagName: "circle",
          selector: "body",
        },
        {
          tagName: "path",
          selector: "icon",
        },
        {
          tagName: "text",
          selector: "label",
        },
      ],
      boundaryPadding: {
        horizontal: PADDING_L,
        top: PADDING_L,
        bottom: PADDING_S,
      },
    }
  );

  export const Link = dia.Link.define(
    ShapeTypesEnum.LINK,
    {
      attrs: {
        root: {
          cursor: "pointer",
        },
        line: {
          fill: "none",
          connection: true,
          stroke: '#008ac5',
          strokeWidth: LINE_WIDTH,
        },
        wrapper: {
          fill: "none",
          connection: true,
          stroke: "transparent",
          strokeWidth: 10,
        },
        arrowhead: {
          d: "M -5 -2.5 0 0 -5 2.5 Z",
          stroke: DARK_COLOR,
          fill: DARK_COLOR,
          atConnectionRatio: 0.55,
          strokeWidth: LINE_WIDTH,
        },
      },

      labels: [
        {
          attrs: {
            labelText: {
              text: "Label",
            },
          },
          position: {
            distance: 0.25,
          },
        },
      ],
    },
    {
      markup: [
        {
          tagName: "path",
          selector: "line",
        },
        {
          tagName: "path",
          selector: "wrapper",
        },
        {
          tagName: "path",
          selector: "arrowhead",
        },
      ],
      generateId: function () {
        const prefix = "L";
        const count = L_COUNT;
        L_COUNT += 1;
        return prefix + "" + count;
      },
      defaultLabel: {
        markup: [
          {
            tagName: "rect",
            selector: "labelBody",
          },
          {
            tagName: "text",
            selector: "labelText",
          },
        ],
        attrs: {
          labelText: {
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            textWrap: {
              width: 200,
              height: 100,
              ellipsis: true,
            },
            cursor: "pointer",
            fill: DARK_COLOR,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            pointerEvents: "none",
          },
          labelBody: {
            ref: "labelText",
            fill: BACKGROUND_COLOR,
            stroke: BACKGROUND_COLOR,
            strokeWidth: 2,
            width: "calc(w)",
            height: "calc(h)",
            x: "calc(x)",
            y: "calc(y)",
          },
        },
      },
    }
  );
