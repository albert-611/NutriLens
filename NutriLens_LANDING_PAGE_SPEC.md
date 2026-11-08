# NutriLens \| Public Landing Page Specification

**Document type:** Frontend product and implementation specification\
**Project:** NutriLens --- Nutrition Intelligence\
**Version:** 1.0\
**Status:** Approved design direction for Phase 2\
**Primary audience:** Hackathon judges, prospective users, partners and
visitors\
**Primary market context:** Bangladesh-first\
**Related source of truth:** `NutriLens_MASTER_PROJECT.md`\
**Related documents:** `01_PRODUCT_SCOPE.md`,
`02_ARCHITECTURE_AND_STACK.md`, `06_FRONTEND_UI_UX.md`,
`07_SECURITY_TESTING_AND_DEPLOYMENT.md`

------------------------------------------------------------------------

# 1. Purpose

This document defines the public NutriLens landing page: its goals,
content, section order, visual direction, interactions, animation
behavior, responsive requirements and acceptance criteria.

The landing page must communicate the NutriLens product clearly and
encourage visitors to explore the working prototype.

It is a public marketing and product-introduction experience. It is
separate from the authenticated NutriLens application.

**Primary product promise:**

> Turn a food or ingredient photo into a user-confirmed nutrition
> estimate, then help people choose an affordable, culturally familiar
> next meal or shopping list using localized market data.

**Central product story:**

**Vision → Food understanding → Confirmed nutrition → Local market
intelligence → Personalized meal pivot → Shopping list.**

The landing page must explain this complete journey. It must not present
NutriLens as merely a calorie counter, a generic AI chatbot or a
collection of unrelated AI features.

------------------------------------------------------------------------

# 2. Goals and success criteria

## 2.1 Primary goals

1.  Explain what NutriLens does within the first few seconds.
2.  Show why localized nutrition and affordability matter.
3.  Explain the Vision-to-Market workflow visually.
4.  Highlight the product's Bangladesh-first food understanding.
5.  Introduce the core intelligence features without overwhelming
    visitors.
6.  Show how nutrition information connects to local market observations
    and practical meal decisions.
7.  Establish trust through evidence, source transparency and honest
    data labels.
8.  Direct visitors to the prototype through a clear call to action.
9.  Provide a polished, responsive experience in both dark and light
    themes.

## 2.2 Success criteria

A visitor should be able to answer these questions after viewing the
page:

-   What is NutriLens?
-   What problem does it address?
-   How does the food-image-to-shopping-list journey work?
-   Why is local food and market context important?
-   Which parts use AI, and which results are calculated from reviewed
    data?
-   Are the displayed market prices live or simulated?
-   How can the visitor try the prototype?

Do not use fabricated conversion rates, user counts, testimonials,
nutrition outcomes or performance statistics.

------------------------------------------------------------------------

# 3. Scope

## 3.1 Included in this landing page

-   Optional announcement bar
-   Responsive public navigation
-   Hero section
-   Problem and solution section
-   How NutriLens works
-   Core intelligence features
-   Bangladesh-first food intelligence
-   Bazar-to-Plate experience
-   Product preview
-   Trust, evidence and transparency
-   Final call to action
-   Footer
-   Dark and light themes
-   GSAP animations
-   Responsive and accessible interactions

## 3.2 Out of scope

The landing page must not implement or claim the following as working
capabilities unless the corresponding application feature has actually
been completed and tested:

-   Live retailer inventory
-   Live grocery prices when using seeded synthetic records
-   Medical diagnosis or treatment
-   Individual metabolic measurement
-   Glucose-response prediction
-   Guaranteed allergen detection or safety
-   Global food coverage
-   Custom-trained AI models
-   Autonomous multi-agent nutrition coaching
-   Clinical validation that has not occurred

The landing page can introduce future or in-progress capabilities, but
their status must be clear. Do not imply that a marketing preview is a
working feature.

------------------------------------------------------------------------

# 4. Product positioning and messaging

## 4.1 Brand positioning

NutriLens is a Bangladesh-first nutrition intelligence platform that
connects visual food understanding, user-confirmed nutrition estimates
and localized market context to help people make practical, culturally
familiar and budget-aware food decisions.

## 4.2 Suggested brand line

**See your food differently. Eat smarter.**

## 4.3 Recommended hero headline

**Your Food. Your Nutrition. Your Intelligence.**

Alternative headline for design exploration:

**Your Food Has a Story. Discover It.**

Choose one headline for the final hero. Do not display multiple
competing headlines simultaneously.

## 4.4 Supporting hero copy

"Understand what's on your plate, explore its nutritional value, and
discover more affordable ways to eat well with food guidance shaped
around local ingredients and your preferences."

## 4.5 Primary call to action

**Explore NutriLens**

Destination: `/app` if the application is implemented and accessible.
Otherwise, direct to the currently available prototype entry route and
communicate any demo limitations.

## 4.6 Secondary call to action

**See How It Works**

Behavior: scroll to the How NutriLens Works section.

## 4.7 Tone of voice

Use language that is:

-   Clear and approachable
-   Confident but not exaggerated
-   Helpful and practical
-   Culturally aware
-   Transparent about uncertainty
-   Free from unnecessary technical jargon

Avoid claims such as "perfect nutrition", "100% accurate AI",
"guaranteed healthy", "medical-grade", "live market intelligence" or
"the world's first" unless independently substantiated and approved.

------------------------------------------------------------------------

# 5. Landing page information architecture

Use the following section order. The announcement bar is optional; the
remaining sections form the recommended public landing page.

  -----------------------------------------------------------------------
  Order                   Section                 Main purpose
  ----------------------- ----------------------- -----------------------
  0                       Announcement bar        Communicate a short
                                                  launch or demo message

  1                       Navigation              Brand identity and page
                                                  navigation

  2                       Hero                    Explain NutriLens and
                                                  present the main action

  3                       Problem and solution    Explain the gap
                                                  NutriLens addresses

  4                       How it works            Demonstrate the
                                                  Vision-to-Market
                                                  journey

  5                       Core intelligence       Introduce the product's
                          features                differentiators

  6                       Bangladesh-first food   Establish local
                          intelligence            relevance

  7                       Bazar-to-Plate          Explain nutrition,
                          experience              budget and market
                                                  connection

  8                       Product preview         Show the actual
                                                  application experience

  9                       Trust, evidence and     Explain data provenance
                          transparency            and limitations

  10                      Final CTA               Encourage visitors to
                                                  try the prototype

  11                      Footer                  Provide navigation and
                                                  legal links
  -----------------------------------------------------------------------

Keep the page focused. Do not add sections simply to make the page
longer.

------------------------------------------------------------------------

# 6. Section specifications

## 6.1 Announcement bar --- optional

### Purpose

Provide a small, non-intrusive announcement above the main navigation.

### Example copy

"Meet a smarter way to understand everyday food."

Alternative during a hackathon demo:

"Explore the NutriLens interactive prototype."

### Requirements

-   Keep the announcement concise.
-   Do not use fake launch dates or fabricated awards.
-   If dismissible, remember the dismissal only for the current browser
    session or use a simple accessible interaction.
-   Ensure the announcement does not dominate the hero.
-   It may be omitted if it adds no meaningful information.

------------------------------------------------------------------------

## 6.2 Navigation bar

### Purpose

Give visitors a consistent way to explore the landing page, switch
themes and enter the application.

### Desktop navigation

**Left:** - NutriLens logo and wordmark

**Center:** - Product - How It Works - Intelligence - About

**Right:** - Language selector, if implemented - Dark/light theme
switcher - Sign In - Get Started

### Suggested behavior

  Item             Behavior
  ---------------- -------------------------------------------------------
  Logo             Navigate to `/` and return to the top
  Product          Scroll to Product Preview or Features
  How It Works     Scroll to the workflow section
  Intelligence     Scroll to Core Intelligence Features
  About            Scroll to Bangladesh-first or About content
  Theme switcher   Toggle dark/light theme
  Sign In          Navigate to `/login`
  Get Started      Navigate to `/app` or the configured onboarding route

### Interaction requirements

-   Use a sticky or intelligently fixed navigation bar.
-   Keep the header compact while scrolling.
-   Provide clear hover, focus and active states.
-   Use smooth anchor scrolling without trapping or hijacking page
    scroll.
-   On mobile, use an accessible menu button and a compact drawer or
    dropdown.
-   Close the mobile menu after selecting a navigation item.
-   Ensure the menu works with keyboard and touch input.
-   Do not place too many links in the desktop header.

------------------------------------------------------------------------

## 6.3 Hero section

**Priority: Highest**

### Purpose

Communicate the product promise immediately and make the visitor curious
enough to continue.

### Recommended content

**Eyebrow:**

"PERSONALIZED, LOCALIZED NUTRITION INTELLIGENCE"

**Headline:**

"Your Food. Your Nutrition. Your Intelligence."

**Supporting text:**

"Understand what's on your plate, explore its nutritional value, and
discover more affordable ways to eat well with food guidance shaped
around local ingredients and your preferences."

**Primary CTA:**

"Explore NutriLens"

**Secondary CTA:**

"See How It Works"

Optional small trust/context line:

"Built around familiar foods, local context and transparent nutrition
data."

### Visual direction

Create a strong, editorial product visual rather than a generic AI
chatbot illustration.

The visual can include:

-   A realistic Bangladeshi meal or familiar food ingredients
-   A subtle food-scanning frame or ingredient markers
-   A compact food identification panel
-   A small nutrition insight panel
-   A visual connection between a meal and a practical food decision

Possible food examples:

-   Rice
-   Dal
-   Fish
-   Vegetables
-   Eggs
-   Familiar local dishes represented accurately

### Hero composition

Recommended desktop layout:

-   Left: eyebrow, headline, supporting copy and CTAs
-   Right: high-quality food visual with restrained floating interface
    elements

Recommended mobile layout:

-   Text and CTAs first
-   Food visual below the text
-   No overlapping floating panels that obscure the food or create
    horizontal overflow

### Hero interaction

-   Primary CTA navigates to the configured prototype route.
-   Secondary CTA scrolls to How It Works.
-   The visual may have a subtle entrance animation.
-   Avoid distracting continuous movement.

### Content integrity

Any floating nutrition figures must be clearly illustrative or sourced
from an approved sample record. Do not imply that the hero image has
been analyzed live unless it has.

------------------------------------------------------------------------

## 6.4 Problem and solution section

### Purpose

Help visitors understand why NutriLens exists.

### Suggested section heading

"Making better food decisions shouldn't be complicated."

### Suggested introduction

"People make food choices every day, but understanding nutrition, local
food options and affordability often requires information from
disconnected places."

### Three problem themes

#### Problem 1 --- Nutrition is difficult to interpret

People may recognize the food they eat without knowing its nutritional
composition or how portion size changes the estimate.

#### Problem 2 --- Generic guidance misses local context

Food recommendations are less useful when they overlook familiar
ingredients, local dishes, preparation methods and regional food names.

#### Problem 3 --- Nutrition and affordability are disconnected

A recommendation is difficult to act on when it ignores budget, local
price observations, availability uncertainty or ingredients people
already have.

### Solution transition

**"NutriLens connects the plate to the next practical food decision."**

Explain that NutriLens combines:

1.  Visual food understanding
2.  User-confirmed food and portion details
3.  Nutrition estimates based on reviewed food records
4.  Local market observations
5.  Budget- and preference-aware meal alternatives
6.  A consolidated shopping list

### Visual direction

Use a clean three-column layout or an editorial split layout. Each
problem should have a concise explanation and a meaningful visual cue.

Avoid exaggerated fear-based messaging or unsupported claims about
public health outcomes.

------------------------------------------------------------------------

## 6.5 How NutriLens works

**Priority: Highest**

### Purpose

Explain the complete Vision-to-Market workflow in a way that is easy to
understand.

### Section heading

"From what's on your plate to what comes next."

### Supporting text

"NutriLens turns a food image into a confirmed nutrition estimate and
helps connect that insight to practical, locally relevant meal choices."

### Four workflow steps

#### Step 1 --- Capture your food

Suggested copy:

"Upload a meal or ingredient photo. NutriLens uses image understanding
to suggest foods it can recognize."

Visual: - Food image upload or camera frame - Example image of a
familiar meal

Important: AI recognition provides candidate suggestions. It does not
establish final food identity or portion size.

#### Step 2 --- Confirm your meal

Suggested copy:

"Review the suggested foods, correct anything that looks wrong, choose
preparation details and confirm portions."

Visual: - Editable food candidates - Preparation state - Portion in
grams

This confirmation step is essential. Do not omit it from the product
story.

#### Step 3 --- Understand your nutrition

Suggested copy:

"See a nutrition estimate calculated from confirmed portions and
reviewed food records, with sources and assumptions made visible."

Visual: - Calories - Protein - Carbohydrates - Fat - Fibre - Data
completeness or source indicator

Do not display invented nutrient values as actual results.

#### Step 4 --- Discover your next meal

Suggested copy:

"Explore familiar alternatives that consider your preferences, budget
and the selected local market context."

Visual: - Meal alternative - Ingredient list - Estimated cost when
supported - Shopping list preview

Clearly label synthetic market observations.

### Interaction

-   Use a four-step visual sequence.
-   On desktop, steps may appear in a horizontal or alternating
    timeline.
-   On mobile, use a vertical sequence.
-   GSAP may reveal each step as it enters the viewport.
-   Do not lock the visitor into a scroll-controlled animation.
-   All step content must remain available when JavaScript animations
    are disabled.

------------------------------------------------------------------------

## 6.6 Core intelligence features

### Purpose

Introduce the capabilities that make NutriLens useful.

### Section heading

"One connected intelligence system."

### Supporting text

"NutriLens brings food understanding, nutrition evidence and practical
meal decisions into one connected experience."

### Feature portfolio

#### 1. Bangla Plate Intelligence

Recognizes supported familiar Bangladesh meals and visible food
components, supports Bangla and English food aliases, and maps
suggestions to reviewed food records.

#### 2. Bazar-to-Plate AI

Connects food preferences and budget with available local market
observations to help compare practical meal options.

#### 3. Nutrient Gap Optimizer

Highlights possible meal-level improvements against a declared goal or
selected target. It must not diagnose a nutrient deficiency.

#### 4. Constraint-Aware Meal Rescue

Helps compare feasible meal alternatives using budget, cuisine
preference, food exclusions, time, equipment and pantry context.

#### 5. Cuisine-Preserving Substitution

Suggests familiar ingredient or meal alternatives rather than
automatically replacing local meals with unrelated foods.

#### 6. Smart Shopping Basket

Combines ingredient quantities, accounts for declared pantry items and
presents purchase quantities and cost where supported.

#### 7. Evidence Receipt

Explains the data sources, portion assumptions, preparation state,
formula version and market observation context behind a result.

#### 8. RAG Nutrition Assistant

Answers supported questions using approved nutrition and recipe
knowledge, with source-linked evidence.

### Layout

Use a restrained feature grid or a few larger feature panels.

Recommended hierarchy:

-   One or two larger featured capabilities
-   Supporting feature cards
-   Consistent iconography
-   Short copy
-   Optional "Explore the workflow" link

Do not give every feature an oversized card. Avoid repetitive layouts
that look like a generic AI SaaS template.

### Feature status

The interface must distinguish:

-   Available in the prototype
-   Demonstration/sample experience
-   In progress
-   Planned

Only label a feature "Available" after its user-facing workflow has been
implemented and tested.

------------------------------------------------------------------------

## 6.7 Bangladesh-first food intelligence

**Priority: High**

### Purpose

Make the local relevance of NutriLens unmistakable.

### Section heading

"Nutrition intelligence that understands your food."

Alternative:

"Built around the foods you know."

### Suggested copy

"Food guidance becomes more useful when it understands familiar
ingredients, local names, preparation methods and everyday meals.
NutriLens begins with Bangladesh-focused food knowledge and a localized
market demonstration."

### Visual content

Use authentic, high-quality food photography featuring familiar foods,
for example:

-   Rice
-   Dal
-   Fish
-   Seasonal vegetables
-   Eggs
-   Chickpeas and pulses
-   Supported local recipes

### Supporting points

-   Bangla and English food names and aliases
-   Familiar meal components
-   Preparation-aware food records where supported
-   Localized recipe examples
-   Bangladesh-first market context
-   Metric quantities and localized currency presentation

### Important boundaries

-   Do not imply that all Bangladeshi foods are covered.
-   Do not claim complete regional or seasonal coverage.
-   Do not assume that a food's nutrient profile is identical across all
    varieties and preparations.
-   Do not use stock imagery that misrepresents a local dish.
-   Do not imply that food recognition can reliably identify hidden oil,
    salt, sauce or ingredients from an image alone.

------------------------------------------------------------------------

## 6.8 Bazar-to-Plate experience

**Priority: Highest**

### Purpose

Show the central differentiator: connecting nutrition guidance to
affordability and local market context.

### Section heading

"Good food decisions should make sense for your budget."

### Suggested copy

"NutriLens connects meal choices with local food price observations,
helping users explore familiar alternatives that fit their preferences
and budget."

### Suggested visual flow

1.  User chooses a market context.
2.  User sets a budget and food preferences.
3.  NutriLens compares supported meal options using seeded market
    observations.
4.  User selects an alternative.
5.  NutriLens prepares a consolidated shopping list.

### Example interface elements

-   Market selector
-   Food item
-   Price per unit
-   Observation date/time
-   Price source or data mode
-   Meal option
-   Estimated ingredient cost
-   Budget comparison
-   Shopping list preview

### Data-mode disclosure

The first prototype uses synthetic Bangladesh market observations.

Every market-related preview must display a visible label:

**SIMULATED DEMO DATA**

Also display an observation timestamp and explain that the values are
demonstration records, not live store prices or confirmed stock.

Do not use labels such as:

-   Live market price
-   Available now
-   Real-time stock
-   Current retailer price

unless a real, authorized and tested data source supports the claim.

### Missing information

If a price or stock value is unknown, show "Price unavailable" or "Stock
information unavailable". Do not fabricate a replacement value.

------------------------------------------------------------------------

## 6.9 Product preview

### Purpose

Show visitors what using the actual NutriLens application looks like.

### Section heading

"See NutriLens in action."

### Recommended previews

1.  Dashboard
2.  Food Scanner / Analyze
3.  Confirm Foods
4.  Nutrition Report
5.  Bazar Intelligence
6.  Meal Rescue / Planner
7.  Smart Shopping Basket

### Presentation

-   Use screenshots from the actual implemented prototype when
    available.
-   Prefer one large product preview with a few supporting interface
    views.
-   Keep screenshots consistent with the real application's design
    system.
-   Ensure the preview works in both page themes.
-   Provide short explanations for each interface.

### Prototype integrity

If a screen is a static mockup, label it as a preview or concept.

Do not present a static screenshot as evidence that an unfinished
feature is operational.

Replace temporary previews with actual screenshots after the relevant
application milestone is complete.

------------------------------------------------------------------------

## 6.10 Trust, evidence and transparency

**Priority: High**

### Purpose

Explain how NutriLens handles uncertainty and why visitors should
interpret its outputs responsibly.

### Section heading

"Clear insights. Visible evidence. Honest limitations."

### Suggested copy

"Nutrition decisions deserve more than a confident-looking number.
NutriLens is designed to show the data, assumptions and market context
behind its recommendations."

### Four trust principles

#### 1. User-confirmed food

AI suggestions are reviewed by the user before authoritative nutrition
calculations.

#### 2. Traceable nutrition data

Nutrition estimates use reviewed food records and documented sources.
Unknown nutrient values remain unknown rather than being silently
treated as zero.

#### 3. Visible assumptions

Portion size, preparation details, incomplete nutrient data and
calculation context should be accessible.

#### 4. Honest market information

Synthetic market observations are visibly identified. Unknown prices and
uncertain stock are not presented as verified facts.

### Evidence Receipt preview

Show a small example of the information a visitor can inspect:

-   Confirmed food identity
-   Portion in grams
-   Preparation state
-   Food data source
-   Nutrient completeness
-   Calculation or formula version
-   Market observation timestamp, if relevant
-   Synthetic-data disclosure, if relevant

### Health disclaimer

NutriLens provides general food and nutrition information. It is not a
medical diagnostic service and does not replace individualized advice
from a qualified healthcare professional.

Do not imply guaranteed allergen detection or clinical accuracy.

------------------------------------------------------------------------

## 6.11 Final call to action

### Purpose

Close the product story and give visitors one clear next action.

### Recommended headline

**"Make Every Meal a Smarter Decision."**

### Supporting copy

"Explore how food understanding, nutrition evidence and local market
context can work together to make everyday food choices more practical."

### CTA

**Explore NutriLens**

Optional secondary link:

"Review how it works"

### Visual direction

-   Strong typography
-   Deep green or theme-aware background
-   Restrained food or ingredient visual
-   Clear CTA
-   Minimal distractions

Do not add fake urgency, countdowns or unsupported claims.

------------------------------------------------------------------------

## 6.12 Footer

### Brand area

-   NutriLens logo
-   Short product description
-   Optional social links only when actual destinations exist

### Navigation groups

**Product** - How It Works - Intelligence Features - Product Preview

**Project** - About NutriLens - Contact, when available

**Legal** - Privacy Policy - Terms of Use

Do not create fake contact details or broken social links. If legal
pages are not yet available, use working placeholder routes with clearly
identified draft status or omit the links until they exist.

### Footer note

"Nutrition information is provided for general informational purposes.
Market information in the prototype may include simulated demonstration
data."

Include the current year dynamically or update it during implementation.

------------------------------------------------------------------------

# 7. Visual design system

## 7.1 Overall direction

Build a premium, calm, modern nutrition technology experience.

The design should feel:

-   Trustworthy
-   Editorial
-   Human
-   Intelligent
-   Locally relevant
-   Clear and uncluttered

Avoid:

-   Generic AI landing page templates
-   Excessive glassmorphism
-   Neon gradients
-   Constant glowing effects
-   Too many floating cards
-   Unnecessary decorative charts
-   Excessive rounded containers
-   Overly dense text
-   Fake product metrics
-   Random stock photography

## 7.2 Brand colors

Use a forest-green-led palette. Define colors as semantic design tokens
rather than scattering raw color values throughout components.

Suggested starting palette:

  Token         Suggested value   Use
  ------------- ----------------- -----------------------
  Forest 950    `#092B22`         Deep brand background
  Forest 900    `#10392D`         Dark surfaces
  Forest 800    `#174B39`         Brand surfaces
  Emerald 600   `#16845B`         Primary accent
  Mint 300      `#A8DCC2`         Soft accent
  Warm 50       `#F7F8F3`         Light page background
  White         `#FFFFFF`         Light surfaces
  Ink 950       `#17231D`         Light theme text
  Neutral 500   `#737D76`         Secondary text

These are initial design references, not mandatory final values. Verify
contrast and adjust where needed.

## 7.3 Typography

Use a professional, readable font system.

Requirements:

-   Strong but restrained hero typography
-   Clear heading hierarchy
-   Comfortable body text line height
-   Readable small labels
-   Consistent font weights
-   Support for Bangla glyphs if Bangla copy is displayed

Choose a font with good Latin and Bangla support or define appropriate
locale-specific font fallbacks.

Do not use more font families than necessary.

## 7.4 Layout and spacing

-   Use a consistent content max-width.
-   Keep section spacing generous but not wasteful.
-   Align section headings consistently.
-   Use a responsive grid.
-   Maintain predictable vertical rhythm.
-   Ensure visual elements do not overlap text.
-   Avoid fixed heights that clip translated or responsive content.

## 7.5 Imagery

Prefer authentic, high-quality food imagery.

For Bangladesh-focused sections, use images that accurately represent
local meals and ingredients.

Requirements:

-   Consistent image treatment and aspect ratios
-   Optimized file sizes
-   Descriptive alt text
-   Responsive image behavior
-   No watermarks
-   No misleading food imagery
-   Respect image licenses and usage rights

Use actual application screenshots for product previews when available.

------------------------------------------------------------------------

# 8. Dark and light themes

Both themes are required and must receive equal design attention.

## 8.1 Theme behavior

-   Provide a visible theme switcher in the navigation.
-   Use clear sun/moon icons with accessible labels.
-   Respect the user's system preference on first visit.
-   Persist an explicit user selection in `localStorage`.
-   Restore the saved theme after refresh.
-   Avoid a flash of the wrong theme during initial page render.
-   Apply theme tokens consistently to all landing page sections.
-   Ensure image overlays, borders, buttons, menus and focus states work
    in both themes.

## 8.2 Dark theme direction

-   Deep forest-green or charcoal-green page background
-   Slightly elevated dark surfaces
-   Soft, readable text
-   Restrained emerald accents
-   Visible but subtle borders
-   Controlled image contrast
-   No excessive neon glow

## 8.3 Light theme direction

-   Warm off-white page background
-   White or lightly tinted surfaces
-   Deep green headings and body text
-   Restrained emerald accents
-   Subtle neutral borders
-   Comfortable image contrast
-   No washed-out text or low-contrast controls

## 8.4 Theme transition

Use a short, subtle transition for color and background changes.

Do not animate layout dimensions or cause content to jump during theme
changes.

Respect `prefers-reduced-motion`.

## 8.5 Theme acceptance checks

-   Theme can be changed from the public navigation.
-   Theme applies to every landing page section.
-   Theme remains selected after refresh.
-   First-visit theme respects system preference.
-   Keyboard users can operate the switcher.
-   Both themes pass contrast checks.
-   No unthemed flash or unreadable image overlay appears.

------------------------------------------------------------------------

# 9. GSAP animation specification

GSAP is the approved animation library for the landing page.

Use GSAP and the ScrollTrigger plugin where appropriate. Do not add a
second animation library for the same purpose.

## 9.1 Animation principles

Animations should:

-   Explain the product story
-   Direct attention
-   Reinforce hierarchy
-   Feel smooth and restrained
-   Avoid delaying access to content
-   Preserve usability on mobile
-   Respect reduced-motion preferences

Do not animate every element.

Do not use scroll hijacking, forced scroll sequences or animations that
prevent users from reaching content.

## 9.2 Recommended animation map

  -----------------------------------------------------------------------
  Section                 Animation               Trigger
  ----------------------- ----------------------- -----------------------
  Hero                    Text stagger and visual Initial page load
                          entrance                

  Hero visual             Subtle image or panel   Initial page load
                          reveal                  

  Problem                 Heading and three       Scroll into view
                          problem items reveal    

  Solution                Product workflow visual Scroll into view
                          reveal                  

  How it works            Four steps reveal in    Scroll into view
                          sequence                

  Features                Feature cards stagger   Scroll into view
                          into view               

  Bangladesh-first        Food image reveal and   Scroll into view
                          restrained parallax     

  Bazar-to-Plate          Workflow or comparison  Scroll into view
                          elements reveal         

  Product preview         Interface screenshot    Scroll into view
                          reveal                  

  Trust                   Evidence items reveal   Scroll into view

  Final CTA               Heading and CTA         Scroll into view
                          entrance                
  -----------------------------------------------------------------------

## 9.3 Motion guidance

Suggested behavior:

-   Use opacity and modest transform changes for reveals.
-   Use staggered timing for groups.
-   Keep most entrance animations short.
-   Use parallax only where it adds meaning.
-   Avoid animating large amounts of text character by character.
-   Avoid continuous looping motion unless it is subtle and useful.
-   Do not make the main CTA wait for an animation to finish before
    becoming usable.

## 9.4 Technical implementation requirements

-   Register GSAP plugins once in an appropriate client-side location.
-   Use `gsap.context()` or an equivalent scoped cleanup pattern in
    React.
-   Revert timelines and ScrollTriggers when components unmount.
-   Avoid duplicate ScrollTriggers after route changes or development
    hot reload.
-   Ensure animations do not run against missing DOM elements.
-   Do not access browser-only APIs during server-independent module
    evaluation if that creates runtime issues.
-   Avoid animation-driven layout shifts.
-   Use `prefers-reduced-motion` to disable or simplify non-essential
    animation.
-   Content must remain visible and understandable when animations are
    disabled.
-   Verify animation performance on lower-powered mobile devices.

------------------------------------------------------------------------

# 10. Responsive behavior

The landing page must work across the following test widths:

  Device class     Test width
  -------------- ------------
  Desktop             1440 px
  Laptop              1280 px
  Tablet               768 px
  Mobile               390 px
  Small mobile         360 px

Also test intermediate widths and orientation changes.

## 10.1 Desktop

-   Use a balanced content width.
-   Use multi-column sections where useful.
-   Keep the hero visual prominent without overpowering the headline.
-   Keep navigation links readable and spaced.
-   Avoid overly wide text lines.

## 10.2 Tablet

-   Reduce grid columns when necessary.
-   Keep headings and imagery balanced.
-   Prevent navigation collisions.
-   Preserve the order and meaning of the product story.

## 10.3 Mobile

-   Use a compact accessible navigation.
-   Stack hero content and visual.
-   Use single-column or carefully designed horizontal feature layouts.
-   Keep CTA buttons easy to tap.
-   Prevent horizontal overflow.
-   Avoid oversized floating UI overlays.
-   Keep food images at useful sizes.
-   Ensure long text and Bangla text wrap correctly.
-   Keep all important content available without animation.

------------------------------------------------------------------------

# 11. Accessibility requirements

-   Use semantic landmarks: header, nav, main, section and footer.
-   Use a logical heading hierarchy.
-   Provide meaningful alt text for informative images.
-   Use empty alt text for purely decorative images.
-   Ensure all interactive controls have accessible names.
-   Provide visible keyboard focus.
-   Support keyboard navigation.
-   Ensure theme switching is accessible.
-   Do not communicate status by color alone.
-   Maintain sufficient contrast in both themes.
-   Respect reduced-motion preferences.
-   Avoid flashing or rapidly moving visual effects.
-   Ensure mobile menus expose their expanded/collapsed state.
-   Ensure anchor navigation does not hide headings behind the sticky
    header.
-   Keep content understandable when animation is unavailable.

------------------------------------------------------------------------

# 12. SEO and social sharing

Implement basic metadata for the public landing page:

-   Page title:
    `NutriLens — Personalized, Localized Nutrition Intelligence`
-   Meta description describing the Vision-to-Market product promise
-   Theme color appropriate to the selected default brand
-   Open Graph title, description and preview image
-   Twitter/X card metadata where appropriate
-   Favicon and application icon
-   Canonical URL only after the production domain is known

Do not invent a production domain.

Use descriptive image filenames and alt text.

Ensure the page has a meaningful title and description even if social
preview assets are not yet ready.

------------------------------------------------------------------------

# 13. Performance requirements

-   Optimize and compress images.
-   Use modern image formats where supported.
-   Lazy-load below-the-fold images.
-   Do not lazy-load the primary hero image if it is needed for the
    initial visual.
-   Reserve image dimensions to reduce layout shift.
-   Avoid unnecessary dependencies.
-   Avoid oversized background videos.
-   Keep GSAP animations lightweight.
-   Avoid loading multiple large animation assets simultaneously.
-   Test actual page performance after implementation.
-   Prefer CSS for simple hover and focus transitions; use GSAP for
    meaningful sequences.

------------------------------------------------------------------------

# 14. Routing and navigation integration

The landing page is public.

Recommended public routes:

-   `/` --- landing page
-   `/login` --- sign-in
-   `/register` --- registration

The authenticated application should use a separate route space,
preferably under `/app`.

Suggested destinations:

-   `/app` --- dashboard or prototype entry
-   `/app/analyze` --- food analysis
-   `/app/report` --- nutrition report
-   `/app/bazar` --- market intelligence
-   `/app/meal-rescue` --- meal alternatives
-   `/app/shopping` --- shopping list

Use the route structure defined by the current project architecture if
it differs. Do not create duplicate route systems.

Navigation CTAs must point to real routes. If a destination is not
implemented yet, use a clear prototype notice or disable the action with
an explanation rather than linking to a broken page.

------------------------------------------------------------------------

# 15. Content and data integrity rules

These rules apply to every visual, label, card, screenshot and statement
on the landing page.

1.  Do not invent user counts, ratings, testimonials, awards or impact
    metrics.
2.  Do not display fake nutrition results as verified outputs.
3.  Do not call synthetic market observations live prices.
4.  Display `SIMULATED DEMO DATA` wherever synthetic market data is
    shown.
5.  Preserve unknown nutrient values as unknown.
6.  Explain that image recognition proposes candidates and users confirm
    food identity and portions.
7.  Do not claim hidden ingredients can be reliably identified from an
    image.
8.  Do not imply that every Bangladesh food or regional market is
    covered.
9.  Do not claim medical diagnosis or guaranteed allergen safety.
10. Do not claim clinical validation without evidence.
11. Use real screenshots of the application when available.
12. Mark concept visuals and unfinished capabilities appropriately.

------------------------------------------------------------------------

# 16. Recommended React component organization

Preserve the repository structure in `NutriLens_MASTER_PROJECT.md` and
`02_ARCHITECTURE_AND_STACK.md`.

The master structure includes:

``` text
src/
  pages/
  components/
  contracts/
  lib/
  i18n/

supabase/
  functions/
  migrations/

data/
tests/
docs/
```

The following is a suggested landing-page component organization within
that structure. Adapt it to the repository rather than replacing the
approved architecture.

``` text
src/
  pages/
    LandingPage/
      LandingPage.tsx
      landing-page.css

  components/
    landing/
      AnnouncementBar.tsx
      LandingNavbar.tsx
      HeroSection.tsx
      ProblemSolutionSection.tsx
      HowItWorksSection.tsx
      IntelligenceFeaturesSection.tsx
      BangladeshFoodSection.tsx
      BazarToPlateSection.tsx
      ProductPreviewSection.tsx
      TrustEvidenceSection.tsx
      FinalCTASection.tsx
      LandingFooter.tsx

    common/
      ThemeToggle.tsx
      Container.tsx
      SectionHeading.tsx
      PrimaryButton.tsx

  lib/
    theme/
      theme-provider.tsx
      theme-storage.ts
    animations/
      gsap-config.ts
      use-scroll-reveal.ts

  i18n/
    en.json
    bn.json
```

Component names and file boundaries may be adjusted to match the
existing project conventions.

Do not put the entire landing page into one giant component.

Avoid creating a separate component for every trivial text element.

------------------------------------------------------------------------

# 17. Implementation workflow for Antigravity

Before implementation:

1.  Read the master project document and relevant supporting documents.
2.  Inspect the existing repository and current Phase 2 state.
3.  Confirm the current routing and component conventions.
4.  Confirm whether the theme system already exists.
5.  Confirm which application routes are implemented.
6.  Identify which product screenshots or approved images are available.
7.  Present a concise implementation plan.

Then implement in small milestones:

## Landing milestone L1 --- Foundation

-   Create the landing page route.
-   Create the public page layout.
-   Establish semantic section containers.
-   Confirm the public navigation works.

## Landing milestone L2 --- Design system and themes

-   Establish semantic color tokens.
-   Implement dark theme.
-   Implement light theme.
-   Implement persistent theme switching.
-   Verify both themes across the page.

## Landing milestone L3 --- Hero and core storytelling

-   Implement hero.
-   Implement problem and solution.
-   Implement How It Works.
-   Verify all copy and CTA destinations.

## Landing milestone L4 --- Product sections

-   Implement intelligence features.
-   Implement Bangladesh-first section.
-   Implement Bazar-to-Plate.
-   Implement product preview.
-   Implement trust and evidence.

## Landing milestone L5 --- GSAP

-   Implement scoped entrance animations.
-   Implement ScrollTrigger reveals.
-   Implement reduced-motion behavior.
-   Verify cleanup and route changes.

## Landing milestone L6 --- Responsive refinement

-   Implement mobile navigation.
-   Verify responsive image and text layouts.
-   Test all required widths.
-   Fix horizontal overflow and interaction issues.

## Landing milestone L7 --- Quality checks

-   Verify all links and CTA routes.
-   Verify both themes.
-   Verify keyboard navigation.
-   Verify reduced-motion behavior.
-   Run TypeScript checks.
-   Run production build.
-   Inspect browser console.
-   Update README and relevant project documentation.

Do not implement all milestones in one uncontrolled operation.

------------------------------------------------------------------------

# 18. Acceptance checklist

The landing page is complete only when the following criteria pass.

## Product communication

-   [ ] NutriLens purpose is clear within the hero.
-   [ ] Vision-to-Market workflow is explained.
-   [ ] User confirmation is included in the workflow.
-   [ ] Bangladesh-first relevance is clear.
-   [ ] Bazar-to-Plate concept is understandable.
-   [ ] Core features are introduced accurately.
-   [ ] Trust and evidence principles are explained.
-   [ ] No unsupported product claims are present.

## Sections

-   [ ] Announcement bar is implemented or intentionally omitted.
-   [ ] Navigation works.
-   [ ] Hero works.
-   [ ] Problem and solution section works.
-   [ ] How It Works section works.
-   [ ] Core intelligence features section works.
-   [ ] Bangladesh-first section works.
-   [ ] Bazar-to-Plate section works.
-   [ ] Product preview section works.
-   [ ] Trust and evidence section works.
-   [ ] Final CTA works.
-   [ ] Footer links work or are intentionally omitted.

## Themes

-   [ ] Dark theme is complete.
-   [ ] Light theme is complete.
-   [ ] Theme switcher works.
-   [ ] Theme preference persists.
-   [ ] System preference is respected initially.
-   [ ] No incorrect-theme flash is visible.
-   [ ] Both themes have readable contrast.

## Animation

-   [ ] Hero entrance animation works.
-   [ ] Scroll reveals work.
-   [ ] Animations are not excessive.
-   [ ] GSAP cleanup works.
-   [ ] Reduced-motion preference is respected.
-   [ ] Content remains available without animation.
-   [ ] No scroll hijacking occurs.

## Responsive behavior

-   [ ] 1440 px desktop tested.
-   [ ] 1280 px laptop tested.
-   [ ] 768 px tablet tested.
-   [ ] 390 px mobile tested.
-   [ ] 360 px small mobile tested.
-   [ ] No horizontal overflow.
-   [ ] Mobile navigation works.
-   [ ] CTAs remain usable.

## Quality

-   [ ] All routes work.
-   [ ] No broken links.
-   [ ] No fabricated metrics or testimonials.
-   [ ] Synthetic data labels are visible.
-   [ ] Images have appropriate alt text.
-   [ ] Keyboard navigation works.
-   [ ] TypeScript checks pass.
-   [ ] Production build succeeds.
-   [ ] Browser console has no unresolved major errors.

------------------------------------------------------------------------

# 19. Final instruction to the coding agent

Build a premium, clear and trustworthy public landing page for
NutriLens.

The landing page should tell one connected story:

**A person captures food. NutriLens helps identify it. The person
confirms the food and portion. The system presents a sourced nutrition
estimate. Local market context helps the person explore an affordable,
culturally familiar next meal and shopping list.**

Prioritize the quality of the hero, workflow explanation,
Bangladesh-first food presentation, Bazar-to-Plate experience and real
product preview.

Implement both dark and light themes as complete designs.

Use GSAP to support the story with restrained, purposeful motion. Never
let animation reduce accessibility, performance or usability.

Preserve the master project architecture, existing implementation and
documented product boundaries.

Do not fabricate data, claim unfinished capabilities or silently change
the technology stack.

Work incrementally, test each milestone and report what is genuinely
complete.

**The result should feel like a carefully designed nutrition technology
product---not a generic AI SaaS template.**
