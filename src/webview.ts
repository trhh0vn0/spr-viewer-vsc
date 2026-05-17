import { Sprite, SpriteFrame } from './Sprite.js';

window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.type) {
        case 'load':
            handleLoad(new Uint8Array(message.data).buffer);
            break;
        case 'error':
            showError(message.message);
            break;
    }
});

function handleLoad(buffer: ArrayBuffer): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (!context) {
        showError('Cannot get canvas context');
        return;
    }

    let sprite;
    try {
        sprite = Sprite.parse(buffer);
    } catch (e) {
        showError(`Invalid sprite file: ${e}`);
        return;
    }

    updateSize(canvas, sprite.frames);
    renderSprite(context, sprite);
}

function renderSprite(context: CanvasRenderingContext2D, sprite: Sprite): void {
    let lastHeight = 0;

    sprite.frames.forEach((frame: SpriteFrame) => {
        const imgdata = context.createImageData(frame.width, frame.height);
        const length = frame.data.length;

        for (let i = 0; i < length; i++) {
            imgdata.data[i] = frame.data[i];
        }

        context.putImageData(imgdata, 0, lastHeight);
        lastHeight += frame.height;
    });
}

function updateSize(canvas: HTMLCanvasElement, frames: SpriteFrame[]): void {
    let totalHeight = 0;
    let totalWidth = 0;

    frames.forEach((frame) => {
        totalHeight += frame.height;
        totalWidth = totalWidth > frame.width ? totalWidth : frame.width;
    });

    canvas.width = totalWidth;
    canvas.height = totalHeight;
}

function showError(message: string): void {
    const errorEl = document.getElementById('error');
    if (!errorEl) return;

    errorEl.textContent = message;
    errorEl.style.display = 'block';

    const canvas = document.getElementById('canvas');
    if (canvas) canvas.style.display = 'none';
}
declare function acquireVsCodeApi(): {
    postMessage(message: unknown): void;
};

const vscode = acquireVsCodeApi();

console.log('[SPR] renderer.ts loaded');

window.addEventListener('message', (event) => {
    console.log('[SPR] message received:', event.data?.type);
    
    const message = event.data;
    switch (message.type) {
        case 'load':
            console.log('[SPR] data length:', message.data?.length);
            handleLoad(new Uint8Array(message.data).buffer);
            break;
        case 'error':
            showError(message.message);
            break;
    }
});

console.log('[SPR] sending ready');
vscode.postMessage({ type: 'ready' });