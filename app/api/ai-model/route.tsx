import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { WireFrameToCode } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { description, imageUrl, model, uid } = await req.json();

    // Call the AI model API to generate code
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Generate a React and CSS code for the following wireframe description: ${description}. The code should include enhanced UI, animations, hover effects, and be responsive. The wireframe image URL is: ${imageUrl}. Ensure the code is lively, with enhanced UI, animations, and hover effects. The design should closely resemble the wireframe image and be responsive across all devices.
                Generate a single JSX file that fully recreates the provided wireframe image in React with enhanced UI, smooth animations, interactivity, and a visually appealing layout. Ensure the following requirements are met:

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
- The generated code should be displayed as plain, executable JSX code without any additional formatting or encapsulation.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate code from AI model");
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    // Update the database with the generated code
    await db
      .update(WireFrameToCode)
      .set({ code: generatedCode })
      .where(eq(WireFrameToCode.uid, uid));

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}