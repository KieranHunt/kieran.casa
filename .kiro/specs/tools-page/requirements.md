# Requirements Document

## Introduction

This feature adds a dedicated tools page to the Jekyll blog that showcases the various tools created over the years. The page will display tools in a card-based layout similar to the provided screenshot, with each card containing information about the tool and a direct link to access it. The tools page will be integrated into the site navigation and footer for easy discovery.

## Requirements

### Requirement 1

**User Story:** As a blog visitor, I want to see a dedicated tools page that lists all available tools, so that I can easily discover and access the various utilities created by the author.

#### Acceptance Criteria

1. WHEN a user navigates to the tools page THEN the system SHALL display a list of all available tools in a card-based layout
2. WHEN a user views the tools page THEN the system SHALL show each tool with a title, description, and direct link
3. WHEN a user clicks on a tool card or link THEN the system SHALL navigate them directly to the tool

### Requirement 2

**User Story:** As a blog visitor, I want to access the tools page from the main navigation, so that I can easily find it from any page on the site.

#### Acceptance Criteria

1. WHEN a user views any page on the site THEN the system SHALL display a "Tools" link in the navigation bar
2. WHEN a user clicks the "Tools" navigation link THEN the system SHALL navigate to the tools page
3. WHEN a user views the tools page THEN the system SHALL highlight the "Tools" navigation item as active

### Requirement 3

**User Story:** As a blog visitor, I want to access the tools page from the footer, so that I have multiple ways to discover the available tools.

#### Acceptance Criteria

1. WHEN a user views any page on the site THEN the system SHALL display a "Tools" link in the footer
2. WHEN a user clicks the "Tools" footer link THEN the system SHALL navigate to the tools page

### Requirement 4

**User Story:** As a site maintainer, I want the tools page to be statically rendered with no client-side JavaScript, so that it loads quickly and works without JavaScript enabled.

#### Acceptance Criteria

1. WHEN the site is built THEN the system SHALL generate a static HTML page for the tools
2. WHEN a user visits the tools page THEN the system SHALL NOT require JavaScript for any functionality
3. WHEN the site is built THEN the system SHALL use only Tailwind CSS classes for styling

### Requirement 5

**User Story:** As a site maintainer, I want the tools page to match the existing blog styling, so that it feels consistent with the rest of the site.

#### Acceptance Criteria

1. WHEN a user views the tools page THEN the system SHALL use the same layout template as other pages
2. WHEN a user views the tools page THEN the system SHALL use consistent typography and spacing with the blog
3. WHEN a user views the tools page THEN the system SHALL use only Tailwind CSS classes without custom CSS

### Requirement 6

**User Story:** As a site visitor, I want each tool card to provide enough information to understand what the tool does, so that I can decide whether to use it.

#### Acceptance Criteria

1. WHEN a user views a tool card THEN the system SHALL display the tool name as a prominent title
2. WHEN a user views a tool card THEN the system SHALL display a brief description of what the tool does
3. WHEN a user views a tool card THEN the system SHALL provide a clear call-to-action to access the tool
4. WHEN a user views the tools page THEN the system SHALL display cards for csv-to-json, rfc6902, everyit.zone, and recipe search engine tools