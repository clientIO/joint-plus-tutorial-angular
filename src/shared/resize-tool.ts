import { elementTools, dia } from '@joint/plus';

export default class ResizeTool extends elementTools.Control {
    getPosition(view: dia.ElementView) {
        const model = view.model;
        const { width, height } = model.size();
        return { x: width, y: height };
    }

    setPosition(view: dia.ElementView, coordinates: { x: number, y: number }) {
        const model = view.model;
        model.resize(
            Math.max(Math.round(coordinates.x / 2) * 2, 10),
            Math.max(Math.round(coordinates.y / 2) * 2, 10)
        );
    }
}
