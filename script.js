const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptinp = document.querySelector(".prompt-input");
const promptform = document.querySelector(".prompt-form");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const generateButton = document.querySelector(".generate-btn");
const gallery = document.querySelector(".generated-images");
const statusOverlay = document.querySelector(".status-overlay");
const statusContent = document.querySelector(".status-content");
const statusText = document.querySelector(".status-text");

const API_KEY = "#{API_KEY}"; // Replace with your actual API key
const DEFAULT_MODEL = "black-forest-labs/FLUX.1-dev"; 
const examplePrompt = [
    "A serene landscape with mountains and a lake at sunset",
    "A futuristic city skyline with flying cars",
    "A cozy cabin in the woods during winter",
    "A vibrant coral reef teeming with marine life",
    "A majestic lion resting under a tree in the savannah",
    "A bustling market scene in a Middle Eastern city",
    "A peaceful beach with palm trees and clear blue water",
    "A magical forest with glowing mushrooms and fairies",
    "A vintage car parked on a quiet street in autumn",
    "A dramatic thunderstorm over a vast desert landscape",
    "A colorful hot air balloon floating over a valley",
    "A tranquil Japanese garden with cherry blossoms in bloom",
    "A majestic waterfall cascading down a rocky cliff",
    "A picturesque village nestled in the hills",
    "A starry night sky over a calm ocean"
];

(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPreferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarktheme = savedTheme === "dark" || (!savedTheme && systemPreferDark);
    if (isDarktheme) {
        document.body.classList.add("dark-theme");
    }
    themeToggle.querySelector("i").className = isDarktheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
    const isDarktheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarktheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarktheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

promptBtn.addEventListener("click", () => {
    const prompt = examplePrompt[Math.floor(Math.random() * examplePrompt.length)];
    promptinp.value = prompt;
    promptinp.focus();
});

const getImageDimension = (ratio, baseSize = 512) => {
    const [widthRatio, heightRatio] = ratio.split('/').map(Number);
    const scaleFactor = baseSize / Math.sqrt(widthRatio * heightRatio);

    let calculatedWidth = Math.round(widthRatio * scaleFactor);
    let calculatedHeight = Math.round(heightRatio * scaleFactor);

    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
    return { width: calculatedWidth, height: calculatedHeight };
};

const showLoadingOverlay = (message = "Generating images...") => {
    statusOverlay.style.display = 'flex';
    statusOverlay.classList.remove('hidden');
    statusContent.innerHTML = `
        <div class="spinner"></div>
        <p class="status-text">${message}</p>
    `;
};

const showErrorOverlay = (message = "An error occurred.") => {
    statusOverlay.style.display = 'flex';
    statusOverlay.classList.remove('hidden');
    statusContent.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation error-icon"></i>
        <p class="status-text">${message}</p>
    `;
};

const hideOverlay = () => {
    statusOverlay.classList.add('hidden');
    setTimeout(() => {
        statusOverlay.style.display = 'none';
        statusContent.innerHTML = '';
    }, 300);
};

const generateImages = async (model, count, ratio, prompt) => {
    const modelUrl = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(model)}`; 
    const { width, height } = getImageDimension(ratio);

    const imageGenerationPromises = Array.from({ length: count }, async (_, i) => {
        const imgCard = document.querySelector(`#img-${i}`);
        const imgElement = imgCard.querySelector(".generated-img");
        const downloadBtn = imgCard.querySelector('.download-btn');

        imgElement.src = '';
        imgElement.classList.add('hidden');
        
        try {
            console.log(`Generating image ${i + 1} using model: ${model}, prompt: "${prompt}"`);
            const response = await fetch(modelUrl, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: { 
                        width, 
                        height,
                        guidance_scale: 7.5,
                        num_inference_steps: 50
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => response.text());
                const errorMessage = typeof errorData === 'object' && errorData.error ? errorData.error : errorData;
                throw new Error(`API Error (${response.status}): ${errorMessage}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            return new Promise((resolve, reject) => {
                imgElement.src = imageUrl;
                imgElement.onload = () => {
                    imgElement.classList.remove('hidden');
                    resolve();
                };
                imgElement.onerror = (e) => {
                    URL.revokeObjectURL(imageUrl);
                    reject(new Error(`Failed to load image ${i + 1} into DOM: ${e.message}`));
                };

                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.href = imageUrl; 
                    link.download = `generated-image-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
            });
            
        } catch (error) {
            console.error(`Error generating image ${i + 1}:`, error);
            throw error;
        }
    });

    const results = await Promise.allSettled(imageGenerationPromises);
    
    const failedGenerations = results.filter(result => result.status === 'rejected');
    if (failedGenerations.length > 0) {
        const errorMessages = failedGenerations.map(f => f.reason.message).join('; ');
        console.error("Some image generations failed:", errorMessages);
        throw new Error("One or more images failed to generate. Check console for details.");
    }
};

const createImgCards = async (count, ratio) => {
    const imageGrid = document.querySelector('.image-grid');
    imageGrid.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const imgCard = document.createElement('div');
        imgCard.className = 'image-item';
        imgCard.setAttribute('data-ratio', ratio);
        imgCard.id = `img-${i}`;

        const img = document.createElement('img');
        img.className = 'generated-img hidden';
        img.alt = `Generated image ${i + 1}`;

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.title = 'Download Image';
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';

        imgCard.appendChild(img);
        imgCard.appendChild(downloadBtn);
        imageGrid.appendChild(imgCard);
    }
};

const handleFormSubmit = async (e) => {
    e.preventDefault();

    const count = parseInt(countSelect.value) || 1;
    const ratio = ratioSelect.value || "1/1";
    const promptText = promptinp.value.trim();

    if (!promptText) {
        alert("Please enter a prompt for image generation.");
        return;
    }

    generateButton.disabled = true;
    generateButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    countSelect.disabled = true;
    ratioSelect.disabled = true;
    promptinp.disabled = true;
    promptBtn.disabled = true;

    showLoadingOverlay("Setting up image grid...");

    try {
        await createImgCards(count, ratio);
        showLoadingOverlay("Generating images...");
        await generateImages(DEFAULT_MODEL, count, ratio, promptText);
        hideOverlay();
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorOverlay("Generation failed");
    } finally {
        generateButton.disabled = false;
        generateButton.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate';
        
        countSelect.disabled = false;
        ratioSelect.disabled = false;
        promptinp.disabled = false;
        promptBtn.disabled = false;
    }
};

promptform.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);