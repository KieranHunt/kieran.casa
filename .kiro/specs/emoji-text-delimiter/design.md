# Design Document

## Overview

The Emoji Text Delimiter tool will be a client-side React application that allows users to input text and automatically insert a selected emoji between each word. The tool follows the established patterns from the blog's existing tools (RFC6902, JSON Truncation post) while providing enhanced functionality with a more comprehensive emoji selection interface.

The application will be built as a single-page tool using client-rendered React with importmaps, following the same architecture as RFC6902. It will integrate seamlessly with the blog's existing design system using Tailwind CSS and Radix UI components.

## Architecture

### Technology Stack
- **Frontend Framework**: React 18 with JSX
- **Styling**: Tailwind CSS (matching blog's design system)
- **Components**: Radix UI for interactive elements
- **Build System**: Client-side rendering with importmaps and Babel
- **Dependencies**: Delivered via esm.sh CDN
- **Deployment**: Static HTML file in `everyit-zone/index.html`

### Application Structure
```
everyit-zone/
└── index.html (Complete single-file application)
```

The application follows a single-file architecture similar to RFC6902, containing:
- Jekyll front matter for blog integration
- HTML structure with React root container
- Importmap configuration for dependencies
- Babel configuration for JSX compilation
- Complete React component implementation

### State Management
The application uses React's built-in state management with hooks:
- `inputText`: Current text input from user
- `selectedEmoji`: Currently selected emoji for delimitation
- `delimitedText`: Generated output text with emoji delimiters
- `copied`: Temporary state for copy feedback
- `emojiPickerOpen`: State for expanded emoji picker visibility

## Components and Interfaces

### Main Component: EmojiTextDelimiter
The root component that orchestrates the entire application functionality.

**Props**: None (root component)

**State**:
```typescript
interface AppState {
  inputText: string;
  selectedEmoji: string;
  delimitedText: string;
  copied: boolean;
  emojiPickerOpen: boolean;
}
```

### Sub-Components

#### TextInput Component
- **Purpose**: Handles user text input with auto-focus and real-time updates
- **Features**: 
  - Auto-focus on page load
  - Placeholder text guidance
  - Real-time text processing
  - Multi-line support with preserved line breaks
- **Styling**: Matches blog's form input styling (slate color scheme)

#### EmojiSelector Component
- **Purpose**: Provides emoji selection interface
- **Features**:
  - Quick-access popular emojis (similar to image mockup)
  - Visual selection feedback
  - Default emoji (👏) pre-selected
  - Expandable picker for more options
- **Implementation**: Uses Radix UI components for accessibility

#### OutputDisplay Component
- **Purpose**: Shows live preview of delimited text
- **Features**:
  - Real-time updates as user types
  - Copy-to-clipboard functionality
  - Visual feedback for copy action
  - Responsive text display
- **Styling**: Matches blog's code/output styling

#### CopyButton Component
- **Purpose**: Handles clipboard operations with user feedback
- **Features**:
  - One-click copying
  - Visual feedback (icon change)
  - Error handling for clipboard failures
  - Disabled state when no content

## Data Models

### Text Processing Model
```typescript
interface TextProcessor {
  input: string;
  emoji: string;
  process(): string;
}
```

**Processing Logic**:
1. Trim input text
2. Split by whitespace (handling multiple spaces)
3. Filter out empty strings
4. Join with ` ${emoji} ` pattern
5. Preserve line breaks in multi-line input

### Emoji Model
```typescript
interface EmojiOption {
  emoji: string;
  label: string;
  category?: string;
}
```

**Default Emoji Set**:
Based on the mockup image, provide quick access to:
- 👏 (clapping hands - default)
- 🤌 (pinched fingers)
- 👌 (OK hand)
- 💃 (dancing woman)
- 🤝 (handshake)
- 🕺 (dancing man)

## Error Handling

### Input Validation
- **Empty Input**: Display placeholder, disable copy button
- **Whitespace-only Input**: No output generation
- **Special Characters**: Preserve as part of words
- **Very Long Input**: Handle gracefully without performance issues

### Clipboard Operations
- **Copy Success**: Show checkmark icon briefly
- **Copy Failure**: Display error message, provide fallback
- **Unsupported Browser**: Graceful degradation with manual selection

### Emoji Selection
- **Invalid Emoji**: Reset to default
- **No Selection**: Default to 👏 emoji
- **Picker Errors**: Fallback to basic emoji set

## Testing Strategy

### Unit Testing Approach
While the implementation will be in a single HTML file, testing considerations include:

1. **Text Processing Logic**:
   - Test word splitting with various inputs
   - Test emoji insertion between words
   - Test handling of punctuation and special characters
   - Test multi-line input preservation

2. **User Interaction Testing**:
   - Test auto-focus functionality
   - Test real-time text updates
   - Test emoji selection changes
   - Test copy-to-clipboard functionality

3. **Edge Case Testing**:
   - Empty input handling
   - Very long text processing
   - Special character handling
   - Browser compatibility

### Manual Testing Checklist
- [ ] Page loads with auto-focused text input
- [ ] Default emoji (👏) is pre-selected
- [ ] Text input updates output in real-time
- [ ] Emoji selection changes delimiter in output
- [ ] Copy button works and provides feedback
- [ ] Responsive design works on mobile and desktop
- [ ] Matches blog's visual design
- [ ] All accessibility features function properly

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────┐
│ Page Title (from Jekyll layout)    │
├─────────────────────────────────────┤
│ Text Input Area (large, focused)   │
├─────────────────────────────────────┤
│ Emoji Selector (horizontal row)    │
├─────────────────────────────────────┤
│ Output Display with Copy Button    │
└─────────────────────────────────────┘
```

### Color Scheme
Following the blog's established dark theme:
- **Background**: Dark slate tones
- **Text**: Light slate/white
- **Inputs**: Slate-800 backgrounds with slate-600 borders
- **Accents**: Blue for interactive elements
- **Success**: Green for copy confirmation
- **Error**: Red for error states

### Typography
- **Input Text**: Monospace font for consistency
- **Output Text**: Monospace font matching code blocks
- **UI Text**: System font stack from blog
- **Emoji**: System emoji rendering

### Responsive Behavior
- **Desktop**: Horizontal layout with adequate spacing
- **Tablet**: Maintained horizontal layout with adjusted spacing
- **Mobile**: Stacked layout with touch-friendly targets
- **All Sizes**: Maintain functionality and readability

## Integration Points

### Blog Integration
- Uses Jekyll page layout for consistent header/footer
- Inherits blog's CSS and styling system
- Follows same URL structure (`/everyit-zone/`)
- Matches navigation and branding

### Dependency Management
- All dependencies loaded via esm.sh CDN
- No build process required
- Self-contained single file
- Compatible with Jekyll's static site generation

### Performance Considerations
- Client-side rendering for immediate interactivity
- Minimal JavaScript bundle size
- Efficient text processing algorithms
- Debounced updates for large text inputs