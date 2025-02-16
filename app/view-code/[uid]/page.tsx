"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Sandpack } from "@codesandbox/sandpack-react";

interface WireframeData {
  uid: string;
  description: string;
  imageUrl: string;
  model: string;
  createdBy: string;
  code: string;
}

export default function ViewCodePage() {
  const { uid } = useParams();
  const [data, setData] = useState<WireframeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableDescription, setEditableDescription] = useState("");

  useEffect(() => {
    if (uid) {
      GetRecordInfo();
    }
  }, [uid]);

  const GetRecordInfo = async () => {
    try {
      const result = await axios.get(`/api/wireFrame-to-code?uid=${uid}`);
      setData(result.data);
      setEditableDescription(result.data.description); // Set editable description
      if (result.data.code) {
        setGeneratedCode(result.data.code);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const GenerateCodeFromImage = async () => {
    if (!data || isGenerating) return;

    setIsGenerating(true);

    try {
      const model = data.model;
      const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_AI_API_KEY;

      if (!apiKey) {
        throw new Error("OpenRouter API key is missing.");
      }

      const prompt = `Generate a single JSX file that fully recreates the provided wireframe image in React with enhanced UI, smooth animations, interactivity, and a visually appealing layout. Ensure the following requirements are met:

1. **Wireframe Accuracy & Layout**
   - The generated code should closely resemble the wireframe, maintaining the same layout, structure, and proportions.
   - Ensure all elements are properly aligned, spaced, and positioned using CSS Flexbox or Grid.
   - The design should take up 100% of the screen width while maintaining 100% height, aligning content to one side (left or right). The remaining space should either be left empty or used as a background.

2. **UI Enhancements & Animations**
   - Use modern CSS animations such as hover effects, smooth transitions, slide-ins, fade-ins, and heartbeat effects to make the UI lively.
   - Add interactive elements, including buttons with hover/click effects, and visually appealing animations for enhanced user engagement.
   - Ensure animations are subtle yet engaging, enhancing the user experience without being overwhelming.

3. **Color, Typography & Styling**
   - Maintain the same color scheme and typography as seen in the wireframe. If no exact colors are available, generate complementary colors to match the design.
   - Use proper font sizes, weights, and spacing to ensure readability and aesthetics.
   - Apply hover effects and color contrast for better usability.

4. **Responsiveness**
   - Make the design fully responsive across mobile, tablet, and desktop while maintaining the 100% width constraint.
   - Use CSS Flexbox or Grid to dynamically align and space elements.
   - Ensure a seamless adaptive layout without breaking the design on different screen sizes.

5. **Image Handling & Shape Masking**
   - If an image is present in the wireframe, fetch and display it. If unavailable, retrieve a relevant image from Unsplash using:
     "
     https://api.unsplash.com/photos/random?client_id=yr2xoQHfLuxjBPpFfzYAjNe4X_PUNJYp8UB_Y9kW_F8
    "
   - Apply shape masking (e.g., rounded corners, circular frames, or custom shapes) to improve image aesthetics and maintain design consistency.

6. **Error Handling & Code Quality**
   - Ensure the generated code is free of syntax and runtime errors.
   - Align all elements properly, fix any styling issues, and ensure smooth functionality across different browsers.
   - Use best practices in React and CSS, with well-structured, maintainable, and well-commented code.
   - Minimize redundant styles and unnecessary elements.

7. **Interactivity & Functionality**
   - Add meaningful interactions (e.g., hover effects, animated buttons, smooth transitions, and click responses).
   - Ensure interactive elements are intuitive, engaging, and improve usability.
   - Provide a button or an option to regenerate the code dynamically when clicking "Generate Code."
   - Ensure that the image gets replaced with generated code dynamically.

8. **Single JSX File Output**
   - The generated code should be a single JSX file combining React and CSS in the same file for easy integration.
   - Ensure the output follows React best practices and maintains clean, readable structure.

**Expected Output:**
- A visually enhanced React component with integrated CSS, staying true to the wireframe design while adding animations, interactions, and a modern UI.
- The code should be free of errors and immediately usable in a React project without requiring additional modifications.
- Generate the complete JSX code fulfilling the above criteria.

**Important Note:**
- Do not encapsulate the generated code within multi-line commands or any other formatting that prevents it from being directly usable in a React project.
- The generated code should be displayed as plain, executable JSX code without any additional formatting or encapsulation.`;

      const requestBody = {
        model: model === "deepseek" ? "deepseek/deepseek-r1-distill-llama-70b:free" : model === "llama" ? "meta-llama/llama-3.2-90b-vision-instruct" : "google/gemini-2.0-pro-exp-02-05:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: data.imageUrl,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "",
          "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("API Response:", result); // Log the full response for debugging

      if (!response.ok || result.error) {
        console.error("API Error Response:", result.error);
        throw new Error(result.error?.message || "Failed to generate code from AI model");
      }

      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error("Invalid response from AI model");
      }

      const generatedCode = result.choices[0].message.content;
      setGeneratedCode(generatedCode);

      // Save the generated code to the database
      await axios.post("/api/save-code", {
        uid: data.uid,
        code: generatedCode,
      });

      console.log("Code saved to database successfully!");

    } catch (error) {
      console.error("Error generating code from image:", error);
      alert("Failed to generate code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableDescription(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-gray-700">No Record Found</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-full mx-auto flex">
        {/* Left Side: Image and Details */}
        <div className="w-[400px] bg-gray-800 rounded-lg shadow-lg p-6 mr-6">
          <div className="border rounded-lg overflow-hidden mb-6">
            <img
              src={data.imageUrl || "/placeholder-image.png"} // Use a placeholder image if imageUrl is not available
              alt="Wireframe Preview"
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.png"; // Fallback to placeholder image if the image fails to load
              }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-200">Description</h2>
              <textarea
                value={editableDescription}
                onChange={handleDescriptionChange}
                className="w-full p-2 border rounded-md text-gray-200 bg-gray-700"
                rows={4}
                placeholder="Edit the description to update requirements..."
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-200">Model</h2>
              <p className="text-gray-400">{data.model}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-200">Created By</h2>
              <p className="text-gray-400">{data.createdBy}</p>
            </div>

            <button
              onClick={GenerateCodeFromImage}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin">🌀</span> Generating...
                </>
              ) : (
                <>
                  <span>🎨</span> Generate Code from Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Sandpack for Generated Code */}
        <div className="flex-1 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Generated Code</h2>
          {generatedCode ? (
            <Sandpack
              template="react"
              theme="dark"
              files={{
                "/App.js": {
                  code: generatedCode,
                },
              }}
              options={{
                showLineNumbers: true,
                showTabs: true,
                showConsole: true,
                editorHeight: "600px",
                wrapContent: true,
              }}
            />
          ) : (
            <p className="text-gray-400">No code generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}