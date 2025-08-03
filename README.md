# AI Image Generator

This web application generates images from text prompts using the Hugging Face Inference API. It features a responsive design, dark mode, and dynamic image display.

✨ Features

*   **Text-to-Image:** Creates images from descriptive text prompts.
*   **Dynamic Display:** Responsively displays generated images.
*   **Loading & Error States:** Provides real-time feedback during image generation and displays error messages.
*   **Customizable Output:** Allows users to select the number of images (1-4) and aspect ratios (square, landscape, portrait).
*   **Random Prompt:** Offers example prompts for inspiration.
*   **Dark Mode:** Enables easy switching between light and dark themes.
*   **Downloadable Images:** Allows direct download of generated images.

---

## 🚀 Getting Started

To run locally:

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/ai-image-generator.git
    cd ai-image-generator
    ```
2.  Open `index.html` in your browser (no server required).

### Setting up the Hugging Face API Key

1.  Create a Hugging Face API token with "read" access.
2.  In `script.js`, replace the placeholder in `API_KEY` with your token:

    ```js
    const API_KEY = "hf_YOUR_NEW_AND_CORRECT_API_KEY_GOES_HERE";
    ```

⚠️ **Warning:** Storing API keys in client-side code is insecure for production. Use a backend for secure API handling in public-facing applications.

---

## 🛠️ Technologies Used

*   **HTML5:** Application structure.
*   **CSS3:** Styling and responsiveness.
*   **JavaScript (ES6+):** Dynamic functionality and API interactions.
*   **Hugging Face Inference API:** Image generation service.
*   **Font Awesome:** UI icons.

---

## 🧠 Model

The application uses the `black-forest-labs/FLUX.1-dev` model from Hugging Face.

---

## 💡 Future Improvements

*   Custom dropdown components for improved styling and usability.
*   Image gallery to view previously generated images.
*   Advanced options like negative prompts for greater control.
