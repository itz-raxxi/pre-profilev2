const menuIcon = document.getElementById('menu-icon');
const navMenu = document.getElementById('nav-menu');

menuIcon.addEventListener('click', () => {
    navMenu.classList.toggle('show');
});

const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const downloadButton = document.getElementById('download-button');

const maskImage = new Image();
maskImage.src = 'mask.png'; // Replace with your mask PNG URL
maskImage.onload = () => {
    canvas.width = maskImage.width;
    canvas.height = maskImage.height;
    drawImages(); // Initial draw
};

let userImage = new Image();
let imageX = 0; 
let imageY = 0; 
let scale = 1; 
let isDragging = false;
let startX, startY;
const minScale = 0.1; // Minimum zoom level
const maxScale = 10;   // Maximum zoom level
let initialDistance = 0;

// File input change event
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userImage.src = e.target.result;
            userImage.onload = function() {
                adjustImagePosition();
                drawImages();
            };

            userImage.onerror = function() {
                alert('Error loading image. Please try a different file.');
            };
        };

        reader.onerror = function() {
            alert('Error reading file. Please try again.');
        };

        // Check for valid image types
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            alert('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
            fileInput.value = ''; // Clear the input
            return;
        }

        reader.readAsDataURL(file);
    }
});

// Adjust image position based on scale
function adjustImagePosition() {
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = userImage.width / userImage.height;

    if (imageAspect > canvasAspect) {
        scale = canvas.width / userImage.width;
    } else {
        scale = canvas.height / userImage.height;
    }

    imageX = (canvas.width - userImage.width * scale) / 2;
    imageY = (canvas.height - userImage.height * scale) / 2;
}

// Function to draw images on canvas
function drawImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(userImage, imageX, imageY, userImage.width * scale, userImage.height * scale); 
    ctx.drawImage(maskImage, 0, 0, maskImage.width, maskImage.height);
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.offsetX - imageX;
    startY = e.offsetY - imageY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        imageX = e.offsetX - startX;
        imageY = e.offsetY - startY;
        drawImages();
    }
});

// Pinch-to-zoom functionality
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - imageX;
        startY = e.touches[0].clientY - imageY;
    } else if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
        imageX = e.touches[0].clientX - startX;
        imageY = e.touches[0].clientY - startY;
        drawImages();
        e.preventDefault();
    } else if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        scale *= currentDistance / initialDistance; // Update scale based on pinch distance
        scale = Math .max(minScale, Math.min(scale, maxScale)); // Limit scale
        initialDistance = currentDistance; // Update initial distance for next move
        drawImages();
        e.preventDefault();
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

// Function to calculate distance between two touch points
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to download the canvas content as an image
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pre-profile.jpg';
    link.href = canvas.toDataURL();
    link.click();
});
