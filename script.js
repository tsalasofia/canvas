const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let currentBrush = null;
let isEraserActive = false;
let brushColor = '#000000'; 


const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');


const brush1 = new Image();
const brush2 = new Image();
brush1.src = './brushes/brush1.png'; 
brush2.src = './brushes/brush2.png';  


currentBrush = brush1;


toolbar.addEventListener('change', (e) => {
    if (e.target.id === 'stroke') {
        brushColor = e.target.value;  
    }
    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;  
    }
});


toolbar.addEventListener('click', (e) => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});


toolbar.addEventListener('click', (e) => {
    if (e.target.id === 'brush1') {
        currentBrush = brush1;
        isEraserActive = false;
    }
    if (e.target.id === 'brush2') {
        currentBrush = brush2;
        isEraserActive = false;
    }
    if (e.target.id === 'eraser') {
        isEraserActive = true;
    }
});


const tintBrush = (brush, color) => {
    offscreenCanvas.width = brush.width;
    offscreenCanvas.height = brush.height;

   
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.drawImage(brush, 0, 0, brush.width, brush.height);

    
    offscreenCtx.globalCompositeOperation = 'source-atop';
    offscreenCtx.fillStyle = color;
    offscreenCtx.fillRect(0, 0, brush.width, brush.height);
    offscreenCtx.globalCompositeOperation = 'source-over'; 

   
    return offscreenCanvas;
};


const drawBrush = (e) => {
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
        const tintedBrush = tintBrush(currentBrush, brushColor);
        ctx.drawImage(tintedBrush, x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    }
};


canvas.addEventListener('mousedown', () => {
    isPainting = true;
});

canvas.addEventListener('mouseup', () => {
    isPainting = false;
    ctx.beginPath(); 
});

canvas.addEventListener('mousemove', drawBrush);
