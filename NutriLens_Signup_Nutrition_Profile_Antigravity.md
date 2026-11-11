# NutriLens — Signup & Nutrition Profile Implementation
## Antigravity Development Specification

**Document type:** Implementation prompt / feature specification  
**Feature:** User registration and personalized nutrition profile  
**Source:** `nutritional_intelligence_signup_form.docx`  
**Priority:** High  
**Status:** Ready for implementation

---

# 1. Instructions for Antigravity

Act as a senior full-stack developer and UI/UX engineer. Implement the **NutriLens User Signup & Nutrition Profile** using this specification.

Before making changes:

1. Inspect the existing project structure, package configuration, routing, authentication flow, database schema, reusable components, design tokens, and current theme implementation.
2. Follow the technologies and conventions already used in the project. **Do not replace the existing stack or introduce a new framework.**
3. Reuse existing components and design tokens where possible.
4. Do not break existing pages, authentication, dashboard routes, or features.
5. If a backend or database layer already exists, extend it rather than creating a duplicate system.
6. If a required architectural detail is not present, explain the gap and implement the smallest consistent solution.
7. Do not use mock data as a substitute for real registration or profile persistence in the completed feature.

Implement the feature end to end where the existing project architecture supports it: responsive UI, form validation, secure account creation, nutrition-profile persistence, and post-registration navigation.

---

# 2. Feature Purpose

The signup process collects the information needed to personalize food analysis and nutrition suggestions.

The form must distinguish between:

- **Required account information:** information needed to create and authenticate an account.
- **Personal information:** information used to establish a basic user profile.
- **Health and lifestyle information:** optional information that can improve personalization.
- **Dietary information:** allergies, intolerances, preferences, and restrictions.
- **Nutritional goals:** the user's desired nutrition outcomes.

Health and lifestyle information should remain optional where practical. Explain why sensitive information is requested, obtain explicit consent before saving it, and allow users to update or delete their profile information later.

Do not force users to provide health information to create an account.

---

# 3. Signup Experience and Form Structure

Build a clean, easy-to-follow, multi-step signup experience.

Suggested steps:

1. Personal Information
2. Health Information
3. Dietary Preferences
4. Lifestyle Information
5. Nutritional Goals
6. Account Information
7. Review & Create Account

The step structure is an implementation recommendation. Keep the form easy to navigate and do not make optional health questions feel mandatory.

### Navigation requirements

- Display the current step and overall progress.
- Provide **Back** and **Continue** actions.
- Preserve entered values when users move between steps.
- Validate the current step before allowing the user to continue.
- Clearly identify required and optional fields.
- Allow users to skip optional health and lifestyle sections.
- Show a final review before account creation.
- Prevent accidental duplicate submissions.
- Display clear success and error messages.
- Make the layout responsive on mobile, tablet, and desktop.

---

# 4. Form Field Specification

## Step 1 — Personal Information

| Field | Input Type | Required |
|---|---|---|
| Full name | Text input | Yes |
| Age | Number input, years | Yes |
| Biological sex | Single-select dropdown | Optional |
| Height | Number input, cm or ft/in | Optional |
| Current weight | Number input, kg or lbs | Optional |
| Target weight | Number input, kg or lbs | No |

### Biological sex options

- Male
- Female
- Prefer not to say

### Behaviour

- Allow users to select a consistent height unit.
- Allow users to select a consistent weight unit.
- Store values in a consistent canonical unit in the database where appropriate.
- Preserve the user's preferred display unit.
- Validate numeric values and reject invalid or impossible input.
- Do not infer biological sex from a user's name or other information.

---

## Step 2 — Health Information

All health fields in this step are optional.

### A. Medical Conditions

**Input:** Multi-select dropdown.

Options:

- None
- Diabetes
- Prediabetes
- High blood pressure (hypertension)
- Low blood pressure (hypotension)
- Heart disease
- Kidney disease
- Liver disease
- Thyroid disorders
- PCOS
- High cholesterol
- Obesity
- Anemia
- Gastrointestinal disorders
- Other (specify)

### Behaviour

- Allow multiple selections.
- `None` must be mutually exclusive with all other selections.
- When `Other` is selected, display a text input.
- Save the selected conditions as structured data.
- Do not automatically assume that a condition requires a particular dietary restriction.

### B. Diabetes Type

**Input:** Conditional single-select dropdown.

Display this field when the user selects Diabetes or Prediabetes, according to the product's clinical design.

Options:

- Type 1
- Type 2
- Gestational diabetes
- Prediabetes
- Other
- Not sure

When the triggering medical condition is removed, clear or appropriately update the conditional value so stale data is not retained.

### C. Food Allergies

**Input:** Multi-select dropdown.

Options:

- None
- Peanuts
- Tree nuts (almonds, walnuts, cashews)
- Milk/dairy
- Eggs
- Fish
- Shellfish (shrimp, crab, lobster)
- Soy
- Wheat
- Sesame
- Other (specify)

### Behaviour

- `None` must be mutually exclusive with all other selections.
- Display a text input when `Other` is selected.
- Store allergies separately from food intolerances.
- Do not silently convert an intolerance into an allergy.
- Make allergy information available to the food-analysis and food-warning features through the user's saved profile.

### D. Food Intolerances

**Input:** Multi-select dropdown.

Options:

- None
- Lactose intolerance
- Gluten intolerance
- Fructose intolerance
- Histamine intolerance
- Caffeine sensitivity
- Other (specify)

### Behaviour

- `None` must be mutually exclusive with all other selections.
- Display a text input when `Other` is selected.
- Store intolerances separately from allergies.
- Do not classify an intolerance as an allergy.

---

## Step 3 — Dietary Preferences

### A. Dietary Preference

**Input:** Single-select dropdown.

Options:

- Non-vegetarian
- Vegetarian
- Vegan
- Pescatarian
- Flexitarian
- Other (specify)

When `Other` is selected, display a text input.

### B. Food Restrictions

**Input:** Multi-select dropdown.

Options:

- None
- No red meat
- No seafood
- No pork
- No dairy
- No eggs
- No added sugar
- Low-carbohydrate diet
- Low-sodium diet
- Gluten-free diet
- Other (specify)

### Behaviour

- `None` must be mutually exclusive with all other selections.
- Display a text input when `Other` is selected.
- Preserve the user's selected restrictions as structured data.

### C. Religious/Cultural Dietary Restrictions

**Input:** Multi-select dropdown.

Options:

- None
- Halal
- Kosher
- Hindu dietary restrictions
- Other (specify)
- Prefer not to say

### Behaviour

- Display a text input when `Other` is selected.
- Treat `None` and `Prefer not to say` as exclusive choices.
- Do not infer a user's religious or cultural preferences.

### D. Foods the User Dislikes

**Input:** Optional free-text input.

Allow users to enter foods they dislike. Save this information separately from allergies and intolerances.

---

## Step 4 — Lifestyle Information

All fields in this step are optional.

### A. Physical Activity Level

**Input:** Single-select dropdown.

Options:

- Sedentary (little or no exercise)
- Lightly active
- Moderately active
- Very active
- Extremely active

### B. Exercise Frequency

**Input:** Single-select dropdown.

Options:

- Never
- 1–2 days per week
- 3–4 days per week
- 5–6 days per week
- Every day

### C. Average Sleep Duration

**Input:** Single-select dropdown.

Options:

- Less than 4 hours
- 4–5 hours
- 6–7 hours
- 8–9 hours
- More than 9 hours

---

## Step 5 — Nutritional Goals

### A. Primary Nutritional Goal

**Input:** Single-select dropdown.

Options:

- Weight loss
- Weight gain
- Maintain current weight
- Muscle building
- Blood sugar management
- Blood pressure management
- Improve heart health
- Improve digestive health
- Improve overall nutrition
- Improve fitness and energy
- Other (specify)

When `Other` is selected, display a text input.

### B. Secondary Nutritional Goals

**Input:** Multi-select dropdown.

Options:

- Increase protein intake
- Increase fiber intake
- Reduce sugar consumption
- Reduce sodium consumption
- Increase vitamin intake
- Increase mineral intake
- Improve hydration
- Eat more fruits and vegetables
- Improve meal balance
- Other (specify)

When `Other` is selected, display a text input.

---

## Step 6 — Account Information

| Field | Input Type | Required |
|---|---|---|
| Username | Text input | Yes |
| Email address | Email input | Yes |
| Password | Password input | Yes |
| Confirm password | Password input | Yes |

### Validation requirements

**Username**
- Required.
- Enforce a reasonable minimum and maximum length.
- Check uniqueness on the server.
- Display a useful message if already taken.

**Email**
- Required.
- Validate email format.
- Normalize consistently before saving.
- Enforce uniqueness on the server.
- Do not rely only on client-side validation.

**Password**
- Required.
- Enforce a secure password policy appropriate to the existing authentication system.
- Display password requirements before submission.
- Provide an optional show/hide password control.
- Never store plaintext passwords.

**Confirm password**
- Required.
- Must match the password.
- Do not save the confirmation field.

### Security requirements

- Hash passwords using the project's established secure password-hashing approach.
- Validate all input on the server.
- Use parameterized database queries or the existing ORM/query layer safely.
- Protect registration endpoints against abuse using appropriate rate limiting.
- Do not expose password hashes, tokens, or sensitive health information in logs or error responses.

---

# 5. Review & Create Account

Before submission, show a review screen with grouped information:

1. Personal Information
2. Health Information
3. Dietary Preferences
4. Lifestyle Information
5. Nutritional Goals
6. Account Information

Requirements:

- Display only information the user has provided.
- Mask the password; never display the actual password.
- Provide an Edit action for each section.
- Clearly identify skipped optional sections.
- Do not make users enter optional health information to proceed.

### Consent

Before saving health information, present a clear explanation of:

- Why NutriLens collects health and dietary information.
- How the information supports personalized food analysis and nutrition suggestions.
- That health information is optional where practical.
- How users can update or delete their information.

Obtain explicit consent before saving health information. Store the consent status and relevant timestamp in accordance with the existing privacy architecture.

Do not bundle consent to health-data processing with unrelated marketing consent.

---

# 6. UI/UX Design Requirements

The signup form must feel like a natural part of the existing NutriLens application.

### Visual direction

- Use the existing NutriLens design system.
- Support both **Light Mode and Dark Mode**.
- Maintain consistent typography, spacing, border radius, shadows, and component styling.
- Use the existing green-based NutriLens visual identity.
- Keep the interface clean, modern, professional, and easy to understand.
- Avoid unnecessary visual effects and excessive gradients.
- Use clear labels, helper text, and validation messages.

### Layout

- Use a centered signup container with a readable maximum width.
- Show a step indicator or progress bar.
- Use clear section headings and short descriptions.
- Group related fields logically.
- Use responsive layouts: multiple columns on wide screens and a single column on small screens.
- Keep primary actions easy to find.
- Ensure dropdowns and multi-select controls work properly on touch devices.

### Components

Create reusable components where appropriate:

- `SignupWizard`
- `SignupProgress`
- `PersonalInformationStep`
- `HealthInformationStep`
- `DietaryPreferencesStep`
- `LifestyleInformationStep`
- `NutritionalGoalsStep`
- `AccountInformationStep`
- `SignupReviewStep`
- `FormField`
- `SingleSelect`
- `MultiSelect`
- `OtherSpecifyInput`
- `PasswordInput`
- `ConsentNotice`

These are suggested component responsibilities. Adapt their names and locations to the existing project conventions.

### Accessibility

- Associate every input with a visible label.
- Support keyboard navigation.
- Provide accessible names for icon-only buttons.
- Show validation errors in text, not only through color.
- Maintain sufficient contrast in both themes.
- Use appropriate focus states.
- Ensure dropdowns and multi-select controls are accessible.

---

# 7. Data and Database Requirements

Inspect the existing database before creating or changing tables.

The following is a logical data model, not a requirement to create tables with these exact names. Adapt it to the existing database architecture and naming conventions.

### Suggested entities

| Entity | Purpose |
|---|---|
| users | Account credentials and basic account identity |
| user_profiles | Personal information such as age, height, and weight |
| medical_conditions | User-selected medical conditions |
| user_medical_conditions | Relationship between users and medical conditions |
| food_allergies | Allergy options and definitions |
| user_food_allergies | User-selected allergies |
| food_intolerances | Intolerance options and definitions |
| user_food_intolerances | User-selected intolerances |
| dietary_preferences | Dietary preference options |
| user_dietary_preferences | User's dietary preference |
| food_restrictions | Food restriction options |
| user_food_restrictions | User-selected restrictions |
| lifestyle_profiles | Activity, exercise, and sleep information |
| nutritional_goals | Nutritional goal options |
| user_nutritional_goals | User-selected goals |
| health_data_consents | Health-data consent status and timestamp |

### Data rules

- Keep account credentials separate from nutrition-profile data.
- Keep allergies and intolerances separate.
- Support multiple medical conditions.
- Support multiple allergies, intolerances, restrictions, and secondary goals.
- Support optional values.
- Store `Other` selections and their specified text without losing the original selection.
- Use appropriate foreign keys and indexes.
- Enforce uniqueness where required.
- Use transactions when creating an account and its related profile data.
- Avoid duplicate records when a user edits and saves their profile.
- Never store a comma-separated string as a substitute for properly structured multi-select relationships if the existing database supports relational tables.

### Important

Do not create duplicate tables if equivalent tables already exist. First inspect the schema and prepare a migration or schema update consistent with the project.

---

# 8. Backend and API Requirements

Follow the existing backend architecture and API naming conventions.

Implement or adapt endpoints with equivalent responsibilities to:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create a user account |
| GET | `/api/users/me/profile` | Retrieve the authenticated user's profile |
| PUT/PATCH | `/api/users/me/profile` | Update the user's profile |
| DELETE | `/api/users/me/profile` | Delete profile information, subject to the application's account and data-retention rules |

These are suggested endpoint examples. Reuse existing routes if equivalent functionality already exists.

### Registration behaviour

1. Validate account information.
2. Check username and email uniqueness.
3. Validate health-data consent where health information is submitted.
4. Hash the password.
5. Create the user account.
6. Create the profile and related selections.
7. Use a database transaction to avoid partially created accounts.
8. Return a safe response without sensitive information.
9. Follow the existing login/session/token flow.
10. Navigate the user to the appropriate onboarding completion or dashboard page.

### Profile update behaviour

- Require authentication.
- Allow users to update their own profile only.
- Validate all submitted fields.
- Preserve unrelated fields when using partial updates.
- Replace multi-select relationships safely.
- Record consent changes appropriately.
- Do not allow users to modify another user's profile by changing an ID in the request.

---

# 9. Validation and Conditional Behaviour

Implement the following rules consistently on the frontend and backend:

| Field / Rule | Expected Behaviour |
|---|---|
| Other option | Show a text input when selected |
| None option | Mutually exclusive with other choices in that field |
| Diabetes type | Conditional on Diabetes/Prediabetes selection |
| Allergies | Stored separately from intolerances |
| Optional health data | Can be skipped |
| Optional lifestyle data | Can be skipped |
| Password confirmation | Must match password |
| Username | Must be unique |
| Email | Must be valid and unique |
| Multi-step navigation | Preserve entered values |
| Final submission | Prevent duplicate requests |

Do not rely on frontend validation alone. The backend must independently validate incoming data.

---

# 10. Privacy, Security, and Responsible Nutrition

Health information is sensitive. Apply appropriate safeguards.

- Collect only information necessary for the stated purpose.
- Explain why health information is requested.
- Obtain explicit consent before saving health information.
- Allow users to update or delete their profile information.
- Restrict profile access to the authenticated user and authorized application services.
- Do not expose health information in public responses.
- Avoid logging sensitive profile values.
- Protect endpoints against unauthorized access.
- Use secure password hashing.
- Validate and sanitize user input.
- Use HTTPS in production.
- Follow the project's existing secure session/token practices.

### Nutrition guidance limitation

AI-generated nutrition guidance must be presented as informational. It must not be described as a medical diagnosis or a substitute for advice from a qualified healthcare professional.

Do not invent medical rules or automatically prescribe dietary restrictions based on a selected condition. Any clinical interpretation should be reviewed by a qualified nutrition or healthcare professional.

---

# 11. Integration with NutriLens Features

The saved nutrition profile should be available to relevant NutriLens features through authenticated, authorized application services.

Potential integrations include:

- Personalized food analysis.
- Allergy-aware food warnings.
- Intolerance-aware food information.
- Dietary preference awareness.
- Food restriction awareness.
- Nutrition-goal-based suggestions.
- Lifestyle-aware nutrition personalization.

### Critical allergy-awareness requirement

When a food is analyzed, the application should be able to compare its available ingredient information against the user's saved allergies.

However:

- Do not claim that a food is allergy-safe when ingredient information is missing or incomplete.
- Distinguish confirmed ingredient matches from uncertain or unavailable information.
- Treat possible allergy conflicts as important warnings.
- Do not treat intolerances as allergies.
- Do not infer that a product is free from an allergen solely because the allergen is absent from an incomplete ingredient list.
- Make the limitations of the available food data clear to the user.

This section defines integration expectations. Do not build an unverified medical decision engine as part of signup.

---

# 12. Error, Loading, and Empty States

Implement polished states for:

- Initial form loading, if data must be fetched.
- Saving profile information.
- Successful account creation.
- Username already exists.
- Email already exists.
- Invalid email.
- Password mismatch.
- Weak or invalid password.
- Network failure.
- Server validation errors.
- Session expiration.
- Empty optional sections.
- Failed profile update.

Messages should be understandable and actionable. Do not expose database errors, stack traces, or internal implementation details.

---

# 13. Testing Checklist

## Form and UI

- [ ] All signup steps render correctly.
- [ ] Light and Dark themes work.
- [ ] Layout works on mobile, tablet, and desktop.
- [ ] Back and Continue navigation works.
- [ ] Values remain available when navigating between steps.
- [ ] Optional sections can be skipped.
- [ ] Progress indicator updates correctly.
- [ ] Keyboard navigation works.

## Field behaviour

- [ ] Single-select fields allow only one selection.
- [ ] Multi-select fields allow multiple selections.
- [ ] None is mutually exclusive with other selections.
- [ ] Other opens a text field.
- [ ] Conditional diabetes type appears correctly.
- [ ] Conditional values are cleared or updated when no longer applicable.
- [ ] Password visibility control works.
- [ ] Password confirmation is validated.

## Backend and database

- [ ] Registration creates an account successfully.
- [ ] Duplicate usernames are rejected.
- [ ] Duplicate emails are rejected.
- [ ] Passwords are securely hashed.
- [ ] Profile information is persisted.
- [ ] Allergies and intolerances are stored separately.
- [ ] Multi-select relationships persist correctly.
- [ ] Database transactions prevent partial registration.
- [ ] Authenticated users can retrieve their own profiles.
- [ ] Users cannot access another user's profile.
- [ ] Profile updates work correctly.
- [ ] Optional fields can remain empty.

## Privacy and security

- [ ] Health-data consent is explicit.
- [ ] Consent timestamp is recorded.
- [ ] Sensitive information is not exposed in API responses.
- [ ] Sensitive values are not written to application logs.
- [ ] Server-side validation is implemented.
- [ ] Unauthorized profile access is blocked.

---

# 14. Implementation Workflow for Antigravity

Follow this order:

### Phase A — Project Inspection

- Inspect the existing application.
- Identify the frontend, backend, database, authentication, and routing architecture.
- Identify reusable components and theme tokens.
- Report the files that need modification.

### Phase B — Signup UI

- Build the responsive multi-step form.
- Implement all fields and dropdown options.
- Implement conditional inputs and `Other` fields.
- Implement step navigation and progress.
- Support Light and Dark themes.
- Implement review and consent screens.

### Phase C — Validation

- Implement client-side validation.
- Implement server-side validation.
- Implement mutually exclusive `None` behaviour.
- Implement conditional diabetes-type behaviour.
- Validate units and numeric inputs.

### Phase D — Backend and Database

- Inspect the current schema.
- Create only the necessary migrations or schema changes.
- Implement registration and profile persistence.
- Secure password handling.
- Implement authenticated profile retrieval and updates.
- Use transactions for account creation.

### Phase E — Integration

- Connect the saved profile to existing NutriLens services.
- Make allergy, intolerance, dietary preference, restriction, and goal information available to the relevant features.
- Preserve the distinction between allergies and intolerances.

### Phase F — Testing and Review

- Test all steps and conditional fields.
- Test registration and database persistence.
- Test duplicate-account handling.
- Test profile updates.
- Test authorization.
- Test both themes and responsive layouts.
- Fix errors without breaking existing features.

---

# 15. Final Deliverables

After implementation, provide:

1. A summary of the completed signup experience.
2. The list of created and modified files.
3. Database migrations or schema changes.
4. API endpoints implemented or reused.
5. Validation and conditional behaviour implemented.
6. Security and consent handling details.
7. Test results.
8. Any remaining limitations or tasks requiring a qualified healthcare/nutrition professional.

Do not claim a feature is complete unless it has been implemented and tested.

---

# 16. Final Instructions

Build this as a production-conscious feature within the existing NutriLens application.

**Important priorities:**

1. Correct data collection.
2. Clear distinction between allergies and intolerances.
3. Optional and consent-based health information.
4. Secure account creation and profile storage.
5. Reliable validation and conditional form behaviour.
6. Consistent NutriLens UI in Light and Dark themes.
7. Responsive and accessible user experience.
8. Compatibility with the existing application architecture.

Do not redesign the entire application. Do not replace existing authentication or database architecture unnecessarily. Do not introduce unrelated features.

**Start by inspecting the existing project, then implement the feature in the phases above.**
