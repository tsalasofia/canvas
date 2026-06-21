const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('toolbar');
const galleryContainer = document.getElementById('gallery');

canvas.width = window.innerWidth - canvas.offsetLeft;
canvas.height = window.innerHeight - canvas.offsetTop;

// STATE
let isPainting = false;
let lineWidth = 5;
let brushColor = '#000000';
let currentBrush = null;
let isEraserActive = false;

// UNDO / REDO
let undoStack = [];
let redoStack = [];

// BRUSHES
const brush1 = new Image();
const brush2 = new Image();

brush1.src = './brushes/brush1.png';
brush2.src = './brushes/brush2.png';

currentBrush = brush1;

// OFFSCREEN BRUSH
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

// GALLERY STORAGE
let savedDrawings =
    JSON.parse(localStorage.getItem('artify_gallery')) || [];

// ----------------
// BRUSH COLOR
// ----------------

function tintBrush(brush, color) {
    offscreenCanvas.width = brush.width;
    offscreenCanvas.height = brush.height;

    offscreenCtx.clearRect(
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height
    );

    offscreenCtx.drawImage(
        brush,
        0,
        0,
        brush.width,
        brush.height
    );

    offscreenCtx.globalCompositeOperation =
        'source-atop';

    offscreenCtx.fillStyle = color;

    offscreenCtx.fillRect(
        0,
        0,
        brush.width,
        brush.height
    );

    offscreenCtx.globalCompositeOperation =
        'source-over';

    return offscreenCanvas;
}

// ----------------
// DRAW
// ----------------

function drawBrush(e) {
    if (!isPainting) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isEraserActive) {
        ctx.globalCompositeOperation =
            'destination-out';

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            lineWidth / 2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    } else {
        ctx.globalCompositeOperation =
            'source-over';

        const tinted =
            tintBrush(currentBrush, brushColor);

        ctx.drawImage(
            tinted,
            x - lineWidth / 2,
            y - lineWidth / 2,
            lineWidth,
            lineWidth
        );
    }
}

// ----------------
// HISTORY
// ----------------

function saveState() {
    undoStack.push(
        canvas.toDataURL()
    );

    if (undoStack.length > 20) {
        undoStack.shift();
    }

    redoStack = [];
}

function restoreState(dataURL) {
    const img = new Image();

    img.src = dataURL;

    img.onload = () => {
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            img,
            0,
            0
        );
    };
}

function undo() {
    if (undoStack.length === 0)
        return;

    redoStack.push(
        canvas.toDataURL()
    );

    restoreState(
        undoStack.pop()
    );
}

function redo() {
    if (redoStack.length === 0)
        return;

    undoStack.push(
        canvas.toDataURL()
    );

    restoreState(
        redoStack.pop()
    );
}

// ----------------
// CONTROLS
// ----------------

function handleToolbarChange(e) {
    const { id, value } =
        e.target;

    if (id === 'stroke') {
        brushColor = value;
    }

    if (id === 'lineWidth') {
        lineWidth =
            Number(value);
    }
}

function handleToolbarClick(e) {
    const id = e.target.id;

    switch (id) {

        case 'clear':
            saveState();

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            break;

        case 'brush1':
            currentBrush =
                brush1;

            isEraserActive =
                false;

            break;

        case 'brush2':
            currentBrush =
                brush2;

            isEraserActive =
                false;

            break;

        case 'eraser':
            isEraserActive =
                true;

            break;

        case 'undo':
            undo();
            break;

        case 'redo':
            redo();
            break;

        case 'save':
            saveToGallery();
            break;
    }
}

// ----------------
// PAINT
// ----------------

function startPainting() {
    saveState();

    isPainting = true;
}

function stopPainting() {
    isPainting = false;

    ctx.globalCompositeOperation =
        'source-over';
}

// ----------------
// GALLERY
// ----------------

function displayGallery() {
    galleryContainer.innerHTML =
        '';

    savedDrawings.forEach(
        (drawingData, index) => {

            const item =
                document.createElement(
                    'div'
                );

            item.classList.add(
                'gallery-item'
            );

            const img =
                document.createElement(
                    'img'
                );

            img.src =
                drawingData;

            img.addEventListener(
                'click',
                () => {

                    const image =
                        new Image();

                    image.src =
                        drawingData;

                    image.onload =
                        () => {

                        saveState();

                        ctx.clearRect(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );

                        ctx.drawImage(
                            image,
                            0,
                            0
                        );
                    };
                }
            );

            const deleteBtn =
                document.createElement(
                    'button'
                );

            deleteBtn.innerText =
                'X';

            deleteBtn.classList.add(
                'delete-btn'
            );

            deleteBtn.addEventListener(
                'click',
                (e) => {

                    e.stopPropagation();

                    deleteDrawing(
                        index
                    );
                }
            );

            item.appendChild(
                img
            );

            item.appendChild(
                deleteBtn
            );

            galleryContainer.appendChild(
                item
            );
        }
    );
}

function saveToGallery() {

    savedDrawings.unshift(
        canvas.toDataURL()
    );

    localStorage.setItem(
        'artify_gallery',
        JSON.stringify(
            savedDrawings
        )
    );

    displayGallery();
}

function deleteDrawing(index) {

    savedDrawings.splice(
        index,
        1
    );

    localStorage.setItem(
        'artify_gallery',
        JSON.stringify(
            savedDrawings
        )
    );

    displayGallery();
}

// EVENTS

canvas.addEventListener(
    'mousedown',
    startPainting
);

canvas.addEventListener(
    'mouseup',
    stopPainting
);

canvas.addEventListener(
    'mousemove',
    drawBrush
);

toolbar.addEventListener(
    'change',
    handleToolbarChange
);

toolbar.addEventListener(
    'click',
    handleToolbarClick
);

// INIT

displayGallery();

