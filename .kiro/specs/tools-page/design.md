# Design Document

## Overview

The tools page will be a dedicated Jekyll page that showcases the various tools created over the years in an attractive, card-based layout. The page will integrate seamlessly with the existing blog design, using the same layout template and styling patterns. Each tool will be presented as a card containing a title, description, and direct link to the tool.

## Architecture

The tools page will follow Jekyll's standard page architecture:

- **Layout**: Uses the existing `page.html` layout which wraps content in the `default.html` layout
- **Styling**: Utilizes Tailwind CSS classes exclusively, matching the existing blog's design system
- **Navigation Integration**: Updates to both header navigation and footer links
- **Static Generation**: Fully static HTML generation with no client-side JavaScript requirements

## Components and Interfaces

### Page Structure

```
tools/
└── index.html (Jekyll page with front matter)
```

### Layout Hierarchy

```
tools/index.html
├── layout: page (from _layouts/page.html)
│   └── layout: default (from _layouts/default.html)
│       ├── header (with updated navigation)
│       ├── main (page content)
│       └── footer (with updated links)
```

### Tool Card Component

Each tool will be represented as a card using Tailwind classes. The structure will be:

```html
<div class="bg-slate-800 border-2 border-slate-600 rounded-lg p-6 hover:border-slate-400 transition-colors">
  <div class="mb-4">
    <h3 class="text-xl font-semibold text-slate-100">Tool Name</h3>
  </div>
  <div class="mb-6">
    <p class="text-slate-300 text-sm leading-relaxed">Tool Description</p>
  </div>
  <div>
    <a href="/tool-url/" class="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors">
      Access Tool
    </a>
  </div>
</div>
```

For reusability, this will be implemented as a Jekyll include at `_includes/tool-card.html` that accepts parameters:

```liquid
{% include tool-card.html 
   name="Tool Name" 
   description="Tool Description" 
   url="/tool-url/" 
   color="slate" %}
```

### Navigation Integration

**Header Navigation**: The existing header in `_layouts/default.html` will be updated to include a "Tools" link.

**Footer Navigation**: The existing footer will be updated to include a "Tools" link in the appropriate section.

## Data Models

### Tool Information

Each tool will be defined with the following properties:

```yaml
- name: "Tool Name"
  description: "Brief description of what the tool does"
  url: "/tool-permalink/"
  color_scheme: "color-class" # For visual variety
```

### Tool Definitions

Based on the research, the four tools are:

1. **CSV to JSON**
   - Description: "Convert CSV data to JSON format with automatic type detection and parsing. Supports drag & drop and provides live preview."
   - URL: "/csv-to-json/"
   - Color scheme: Default slate

2. **RFC6902 JSON Patch Generator**
   - Description: "Generate RFC6902 JSON Patch operations by comparing before and after JSON documents with visual diff display."
   - URL: "/rfc6902/"
   - Color scheme: Blue accent

3. **everyit.zone**
   - Description: "Add emoji delimiters between words in your text for social media emphasis with customizable emoji selection."
   - URL: "/everyit-zone/"
   - Color scheme: Green accent

4. **Recipe Search Engine**
   - Description: "Search across curated recipe websites including NYT Cooking, Serious Eats, and more using DuckDuckGo."
   - URL: "/recipe-search-engine/"
   - Color scheme: Orange accent

## Error Handling

### Static Generation Errors
- Jekyll will validate the page structure during build
- Invalid YAML front matter will cause build failures
- Missing layout files will be caught during generation

### Runtime Errors
- No client-side JavaScript means no runtime errors to handle
- All links will be validated during build process
- 404 handling is managed by Jekyll's existing error pages

### Accessibility Considerations
- All cards will have proper heading hierarchy
- Links will have descriptive text
- Color contrast will meet WCAG guidelines
- Keyboard navigation will be fully supported

## Testing Strategy

### Build Testing
- Verify Jekyll builds successfully with new page
- Confirm all internal links resolve correctly
- Validate HTML structure and semantics

### Visual Testing
- Compare styling consistency with existing blog pages
- Test responsive design across different screen sizes
- Verify card layout works with varying content lengths

### Navigation Testing
- Confirm "Tools" link appears in header navigation
- Verify "Tools" link appears in footer
- Test that navigation highlighting works correctly on tools page

### Accessibility Testing
- Run automated accessibility checks
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios

### Performance Testing
- Measure page load times
- Verify no unnecessary JavaScript is loaded
- Confirm images are optimized (if any are added)

## Design Decisions and Rationales

### Card-Based Layout
**Decision**: Use a responsive grid of cards to display tools
**Rationale**: Cards provide clear visual separation, are mobile-friendly, and match the modern design aesthetic shown in the provided screenshot

### Color Scheme Variation
**Decision**: Use different accent colors for each tool card using Tailwind color variants
**Rationale**: Visual variety helps distinguish tools while maintaining overall design consistency. Colors will be implemented through Tailwind classes like `border-blue-600`, `bg-blue-50`, etc.

### No Client-Side JavaScript
**Decision**: Build as a fully static page
**Rationale**: Aligns with requirement for static rendering, improves performance, and maintains consistency with blog's approach

### Tailwind-Only Styling
**Decision**: Use exclusively Tailwind CSS classes
**Rationale**: Maintains consistency with existing codebase and avoids custom CSS maintenance

### Integration with Existing Layouts
**Decision**: Use the existing `page.html` layout and create reusable `_includes/tool-card.html` component
**Rationale**: Ensures consistent styling and structure with other site pages while following the established pattern of using Jekyll includes for reusable components

### Navigation Placement
**Decision**: Add tools link to both header and footer
**Rationale**: Provides multiple discovery paths and matches the pattern of other important site sections

## Implementation Approach

### Phase 1: Page Creation
1. Create the `_includes/tool-card.html` component with Tailwind classes
2. Create the basic tools page structure using the page layout
3. Implement the card-based layout using the include component
4. Add tool content and descriptions

### Phase 2: Navigation Integration
1. Update header navigation in `_layouts/default.html`
2. Update footer navigation in `_layouts/default.html`
3. Test navigation functionality

### Phase 3: Styling and Polish
1. Refine card styling and responsive behavior
2. Add visual enhancements (colors, spacing)
3. Ensure accessibility compliance

### Phase 4: Testing and Validation
1. Test across different devices and browsers
2. Validate HTML and accessibility
3. Verify all links and navigation work correctly