//setup
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('toolbar');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

//state vbs
let isPainting = false;
let lineWidth = 5;
let brushColor = '#000000';
let currentBrush = null;
let isEraserActive = false;

//cepillos
const brush1 = new Image();
const brush2 = new Image();
brush1.src = './brushes/brush1.png';
brush2.src = './brushes/brush2.png';
currentBrush = brush1;

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

// applicacion de color
function tintBrush(brush, color) {
    offscreenCanvas.width = brush.width;
    offscreenCanvas.height = brush.height;

    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.drawImage(brush, 0, 0, brush.width, brush.height);

    offscreenCtx.globalCompositeOperation = 'source-atop';
    offscreenCtx.fillStyle = color;
    offscreenCtx.fillRect(0, 0, brush.width, brush.height);
    offscreenCtx.globalCompositeOperation = 'source-over';

    return offscreenCanvas;
}

//for using current brush/ eraser
function drawBrush(e) {
    if (!isPainting) return;

    const x = e.clientX - canvasOffsetX;
    const y = e.clientY - canvasOffsetY;

    if (isEraserActive) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.globalCompositeOperation = 'source-over';
        const tinted = tintBrush(currentBrush, brushColor);
        ctx.drawImage(tinted, x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    }
}

//Toolbar

function handleToolbarChange(e) {
    const { id, value } = e.target;

    if (id === 'stroke') {
        brushColor = value;
    }

    if (id === 'lineWidth') {
        lineWidth = value;
    }
}

function handleToolbarClick(e) {
    const { id } = e.target;

    switch (id) {
        case 'clear':
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            break;
        case 'brush1':
            currentBrush = brush1;
            isEraserActive = false;
            break;
        case 'brush2':
            currentBrush = brush2;
            isEraserActive = false;
            break;
        case 'eraser':
            isEraserActive = true;
            break;
    }
}

//controls

function startPainting() {
    isPainting = true;
}

function stopPainting() {
    isPainting = false;
    ctx.beginPath();
}

//listeners

canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', drawBrush);

toolbar.addEventListener('change', handleToolbarChange);
toolbar.addEventListener('click', handleToolbarClick);

