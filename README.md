# AI/LLM Style Lead Gen Form Flow

A sophisticated dark-themed multi-step funnel form with AI conversation experience. This component provides an elegant user interface for collecting information through a conversational flow.

![AI/LLM Style Lead Gen Form Flow](https://placeholder.svg?height=400&width=800&query=AI+LLM+Style+Lead+Gen+Form+Flow+with+dark+theme+and+glowing+elements)

## Features

- ✨ Elegant glassmorphic UI with cosmic background
- 💬 Animated typing effect for system messages
- 🔄 Multi-step form with validation
- 💾 Persistent form storage
- 📱 Fully responsive design
- 🚀 Optimized animations and transitions
- 🎨 Customizable color scheme
- 🔍 Accessibility-focused design

## Quick Start

### Option 1: Use with v0

1. Fork this component in v0
2. Customize the questions and form fields in `multi-step-form.tsx`
3. Adjust the styling in `globals.css` if needed
4. Deploy your project

### Option 2: Use with Git

1. Clone this repository
   \`\`\`bash
   git clone https://github.com/yourusername/ai-llm-lead-gen-form.git
   cd ai-llm-lead-gen-form
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Run the development server
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Icon System

This project uses Lineicons for icons. You can find a reference of the icon styles in the [lineicons-styles.txt](./lineicons-styles.txt) file.

To include Lineicons in your project, add the following to your HTML head:

\`\`\`html
<link href="https://cdn.lineicons.com/5.0/lineicons.css" rel="stylesheet" />
\`\`\`

## Customization Guide (No Coding Required)

### Changing Questions

To change the questions in the form:

1. Open `components/form/multi-step-form.tsx`
2. Find the `getQuestionForStep` function
3. Replace the text inside the quotes with your own questions

Example:
\`\`\`typescript
// Change this:
return "Welcome! What's your name?"

// To this:
return "Hi there! What should I call you?"
\`\`\`

### Changing Colors

To change the color scheme:

1. Open `tailwind.config.ts`
2. Find the `colors` section
3. Modify the HSL values for primary and secondary colors

Example for changing primary color to purple:
\`\`\`typescript
// Change this:
"--primary-500": "140 55% 55%",

// To this:
"--primary-500": "270 55% 55%",
\`\`\`

### Changing Background

To change the background:

1. Open `components/background/cosmic-background.tsx`
2. Find the `colors` array in the `drawStars` function
3. Change the colors to your preferred palette

Example:
\`\`\`typescript
// Change this:
const colors = [
  "rgba(144, 218, 184, opacity)", // Mint
  "rgba(160, 230, 200, opacity)", // Light mint
  "rgba(200, 255, 230, opacity)", // Very light mint
  "rgba(255, 255, 255, opacity)", // White
]

// To this:
const colors = [
  "rgba(180, 144, 218, opacity)", // Purple
  "rgba(200, 160, 230, opacity)", // Light purple
  "rgba(230, 200, 255, opacity)", // Very light purple
  "rgba(255, 255, 255, opacity)", // White
]
\`\`\`

## Component Structure

The project is organized into several key components:

- **FormFlowContainer**: Main container for the form flow
- **MultiStepForm**: Manages form state and steps
- **FormStep**: Individual form step with question and input
- **WelcomeBento**: Welcome screen with bento layout
- **ChatMessage**: Message bubble component
- **ChatInput**: Input component with validation
- **CosmicBackground**: Animated background

## Advanced Customization (For Developers)

### Form Validation

Form validation is handled in `utils/form-validation.ts`. You can modify the validation rules by editing the validation functions:

\`\`\`typescript
export const validateEmail = (email: string): ValidationResult => {
  // Your custom validation logic here
}
\`\`\`

### Adding New Steps

To add new steps to the form:

1. Update the `FormData` interface in `multi-step-form.tsx`
2. Add a new case to the `getQuestionForStep` function
3. Add a new case to the `handleSubmit` function
4. Add a new `FormStep` component in the render function
5. Update the `totalSteps` prop in the `FormFlowContainer`

### Styling Components

The project uses Tailwind CSS with custom variables. You can modify the styles in:

- `globals.css` for global styles
- Individual component files for component-specific styles

## Comprehensive v0 Customization Guide

This guide will help you effectively prompt v0 to customize this template according to your specific needs, regardless of your technical expertise.

### 1. Template Adaptation

#### Modifying Core Structure and Layout

**Basic Structure Changes:**
\`\`\`
"Change the form layout to have the questions on the left and inputs on the right"
"Make the form steps appear as a horizontal progress bar at the top"
"Convert the multi-step form into a single-page form with all questions visible at once"
\`\`\`

**Content Modifications:**
\`\`\`
"Update the welcome message to say 'Welcome to [Your Company]' and add a brief description about your service"
"Change the form questions to collect [specific information] from users"
"Add a privacy policy notice at the bottom of the form"
\`\`\`

**Design Style Changes:**
\`\`\`
"Change the design style from glassmorphic to neumorphic with soft shadows"
"Make the form appear more minimalist with less decorative elements"
"Apply a light theme instead of the dark theme"
\`\`\`

#### Tips for Beginners:
- Start with a clear description of what you want to change
- Reference specific elements by their visual appearance or function
- Provide examples of the desired outcome when possible

### 2. Adding Interactive Elements

#### Adding Form Controls:

**Basic Input Types:**
\`\`\`
"Add a multi-select dropdown for users to choose their interests from options: [list options]"
"Include a slider for users to rate their experience from 1-10"
"Add a date picker for scheduling a consultation"
\`\`\`

**Advanced Interactions:**
\`\`\`
"Add a file upload option for users to attach their documents"
"Include a dynamic pricing calculator based on service selections"
"Create a drag-and-drop section for organizing preferences"
\`\`\`

**Customizing Behavior:**
\`\`\`
"Make the email field automatically validate as the user types"
"Add conditional questions that only appear based on previous answers"
"Include a real-time character counter for text fields with a maximum limit"
\`\`\`

#### Tips for Intermediate Users:
- Specify the exact behavior you want for interactive elements
- Describe any validation requirements
- Mention how the element should respond to user actions

### 3. Branding and Color Customization

#### Applying Brand Colors:

**Using Color Codes:**
\`\`\`
"Change the primary color to #3B82F6 and secondary color to #10B981"
"Apply a gradient background from #2563EB to #7C3AED"
"Use RGB values of (59, 130, 246) for buttons and (16, 185, 129) for highlights"
\`\`\`

**Typography Changes:**
\`\`\`
"Change the font to Montserrat for headings and Open Sans for body text"
"Increase the font size of questions to make them more prominent"
"Apply a custom font weight of 600 to all buttons"
\`\`\`

**Logo and Visual Assets:**
\`\`\`
"Add my company logo at the top of the form [attach logo file]"
"Include our brand pattern as a subtle background texture [attach pattern]"
"Add our mascot illustration to the welcome screen [attach illustration]"
\`\`\`

#### Tips for Visual Customization:
- Provide exact color codes (HEX, RGB, or HSL)
- Attach visual assets or provide URLs to them
- Reference specific locations where branding should appear

### 4. Advanced Customization

#### Animations and Effects:

\`\`\`
"Add a subtle floating animation to the form cards"
"Create a typing effect for the welcome message"
"Implement a confetti animation when the form is successfully submitted"
\`\`\`

#### Integrations:

\`\`\`
"Connect the form to our Zapier workflow using this webhook URL: [URL]"
"Add Google Analytics tracking with our tracking ID: [ID]"
"Integrate with our CRM using this API endpoint: [endpoint]"
\`\`\`

#### Custom Logic:

\`\`\`
"Add score calculation based on user responses to questions 2, 4, and 5"
"Implement a recommendation engine that suggests products based on user inputs"
"Create a save-and-continue-later feature with a unique link generation"
\`\`\`

### 5. Prompting Best Practices

#### Writing Effective Prompts:

1. **Be Specific and Detailed**
   - Instead of: "Make the form better"
   - Use: "Increase the spacing between form questions to 24px and add subtle animations when transitioning between steps"

2. **Use Visual References**
   - "Make the form look like this screenshot [attach image]"
   - "Style the buttons similar to this website: [URL]"

3. **Provide Context**
   - "This form will be used for job applications, so we need fields for resume upload and work experience"
   - "Our target audience is seniors, so please increase font sizes and improve contrast"

#### Iterative Approach:

1. Start with a broad request
2. Review the result
3. Make specific refinement requests
4. Repeat until satisfied

#### Handling Errors:

- If v0 misunderstands, clarify your request with more details
- If a feature doesn't work as expected, ask for alternative approaches
- For complex customizations, break them down into smaller, sequential requests

### 6. Example Scenarios for Lead Generation Forms

#### Scenario 1: Real Estate Lead Form

\`\`\`
"Customize this template for a real estate lead generation form that:
1. Asks for property type preferences (apartment, house, condo)
2. Collects budget range using a slider
3. Gathers preferred neighborhoods with a multi-select
4. Asks about timeline for purchase
5. Collects contact information
Use a sophisticated blue and gold color scheme (#1A365D and #C9B037) and add a subtle real estate skyline illustration to the background."
\`\`\`

#### Scenario 2: SaaS Demo Request Form

\`\`\`
"Transform this template into a SaaS demo request form with:
1. Company name and size fields
2. Industry dropdown selection
3. Current challenges (multi-select)
4. Preferred demo date/time
5. Contact information
Use our brand colors (#6366F1 for primary and #10B981 for accents) and add our logo [attach logo]. Make the form feel modern and tech-focused with subtle grid patterns in the background."
\`\`\`

#### Scenario 3: Event Registration Form

\`\`\`
"Convert this template to an event registration form that:
1. Collects attendee name and title
2. Asks for company information
3. Provides workshop selection options
4. Offers meal preference selection
5. Gathers accessibility requirements
Use a vibrant event theme with colors #FF4F5A and #6B46C1. Add a countdown timer to the registration deadline and include our event logo [attach logo]."
\`\`\`

#### Scenario 4: Marketing Consultation Request

\`\`\`
"Adapt this template for a marketing consultation request form that:
1. Asks about current marketing challenges
2. Collects information about target audience
3. Gathers budget range information
4. Asks about marketing goals
5. Collects contact details
Use a professional green and gray color scheme (#2D3748 and #48BB78) with subtle marketing-related icons next to each question."
\`\`\`

### 7. File Structure and Organization

When requesting changes to specific files, it helps to understand the project structure:

- **app/** - Core application files
  - **page.tsx** - Main page component
  - **layout.tsx** - Root layout component
  - **globals.css** - Global styles
  
- **components/** - Reusable UI components
  - **form/** - Form-related components
  - **chat/** - Chat interface components
  - **background/** - Background effects
  - **ui/** - Basic UI elements
  
- **hooks/** - Custom React hooks
- **utils/** - Utility functions

When requesting changes, reference the specific file path:

\`\`\`
"Update the welcome message in components/form/multi-step-form.tsx"
"Change the background animation in components/background/cosmic-background.tsx"
\`\`\`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Icons: [Lineicons](https://lineicons.com/)
- Animation: [Framer Motion](https://www.framer.com/motion/)
- UI Framework: [Next.js](https://nextjs.org/)
