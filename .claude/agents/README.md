# Practice Plan App - Custom Subagents

This directory contains specialized Claude Code subagents that help with understanding and migrating the Practice Plan App from legacy to new implementation.

## Available Subagents

### 1. legacy-mobile-expert
**Specialization**: Legacy mobile app architecture, mobile-web components, mobile UX patterns

**Use when you need to**:
- Understand how a mobile screen/component works in the legacy app
- Document the visual design and styling of mobile components
- Extract mobile-specific user interaction patterns
- Compare legacy mobile implementation with new app
- Migrate mobile-web components to the new architecture

**Example invocations**:
```bash
# Via CLI
claude /agents legacy-mobile-expert "Document the MWList component and all its variants"

# Within Claude Code (Task tool)
Use the legacy-mobile-expert agent to analyze the practice plan creation screen in the legacy mobile app
```

**What it knows**:
- All MW components (MWList, MWCard, MWHeader, MWBottomSheet, etc.)
- Mobile navigation patterns (tabs, modals, stack navigation)
- Touch interactions, gestures, animations
- Mobile visual design system
- React Native / Expo patterns

---

### 2. legacy-web-expert
**Specialization**: Legacy web implementation, responsive patterns, mobile-web switching

**Use when you need to**:
- Understand responsive design patterns in the legacy app
- Document how features adapt between mobile and desktop
- Extract web-specific styling and accessibility
- Analyze the mobile-web view switching logic
- Migrate web patterns to the new app

**Example invocations**:
```bash
claude /agents legacy-web-expert "How does MWViewSwitch determine mobile vs desktop layout?"
```

**What it knows**:
- Mobile-web responsive patterns
- Breakpoint strategies
- Web accessibility (ARIA, keyboard navigation)
- CSS styling approaches
- Browser compatibility patterns
- Desktop vs mobile layout differences

---

### 3. packages-expert
**Specialization**: Shared packages (interfaces, store, mock data, utilities)

**Use when you need to**:
- Understand TypeScript interface definitions
- Generate proper mock data for testing
- Learn Zustand store structure and patterns
- Document entity relationships
- Validate data structures
- Understand subscription, PDF, or other utility packages

**Example invocations**:
```bash
claude /agents packages-expert "Show me the complete Plan interface and explain all fields"
claude /agents packages-expert "How do I generate realistic mock data for practice plans with activities?"
```

**What it knows**:
- All TypeScript interfaces (User, Team, Plan, Activity, etc.)
- Mock data generators and patterns
- Zustand store slices and state management
- PDF generation utilities
- Subscription/feature gate logic
- Shared business logic and utilities

---

### 4. features-expert
**Specialization**: End-to-end feature implementation across UI, state, and data layers

**Use when you need to**:
- Understand complete user workflows for a feature
- Document business logic and validation rules
- Analyze how features integrate with each other
- Map feature implementation from legacy to new app
- Understand permission and subscription tier requirements

**Example invocations**:
```bash
claude /agents features-expert "Walk me through the complete practice plan creation workflow"
claude /agents features-expert "How do tags integrate with plans, templates, and activities?"
```

**What it knows**:
- Core planning features (plans, activities, templates)
- Organization features (tags, calendar, files)
- Team management (coaches, team settings)
- Communication (announcements)
- Analytics (reports, exports)
- Business logic (subscriptions, permissions)
- Cross-feature integrations

---

## How to Use Subagents

### Method 1: Via Claude Code CLI
```bash
# Navigate to project root
cd /Users/adiontaegerron/Documents/TeamParcee/ppa-root

# Invoke a subagent with a task
claude /agents <agent-name> "Your question or task here"

# Examples:
claude /agents legacy-mobile-expert "Analyze the calendar screen implementation"
claude /agents packages-expert "What validation rules exist for the Plan interface?"
claude /agents features-expert "Document the tag management feature end-to-end"
```

### Method 2: Within Claude Code Conversation
In an active Claude Code session, request the Task tool to use a specific subagent:

```
"Use the legacy-mobile-expert agent to analyze how the practice plan editor works"

"Ask the packages-expert to explain the relationship between Plans and Templates"

"Have the features-expert document the complete PDF export workflow"
```

### Method 3: Programmatically (TypeScript/Python)
See individual agent documentation for SDK usage examples.

---

## When to Use Which Agent

### Decision Tree

**Q: Are you working with UI components or screens?**
- Yes, mobile-specific → Use `legacy-mobile-expert`
- Yes, web/responsive → Use `legacy-web-expert`
- No → Continue

**Q: Are you working with data structures or shared code?**
- Yes, TypeScript interfaces → Use `packages-expert`
- Yes, Zustand store → Use `packages-expert`
- Yes, mock data → Use `packages-expert`
- No → Continue

**Q: Are you implementing a complete feature?**
- Yes → Use `features-expert`

### Quick Reference Table

| Task | Agent |
|------|-------|
| Understand a mobile component (MWList, MWCard) | legacy-mobile-expert |
| Analyze responsive layout patterns | legacy-web-expert |
| Get interface definition | packages-expert |
| Generate mock data | packages-expert |
| Understand Zustand slice | packages-expert |
| Document complete user workflow | features-expert |
| Analyze feature integration | features-expert |
| Extract business validation rules | features-expert |
| Compare mobile vs web implementation | Use both legacy-mobile-expert and legacy-web-expert |
| Full feature migration | Use features-expert first, then specific experts as needed |

---

## Typical Workflows

### Workflow 1: Migrating a Screen from Legacy to New App

1. **Understand the feature**:
   ```
   @features-expert Document the [screen name] feature end-to-end
   ```

2. **Analyze mobile implementation**:
   ```
   @legacy-mobile-expert Show me the legacy mobile implementation of [screen]
   ```

3. **Check data structures**:
   ```
   @packages-expert What interfaces are used by [feature]?
   ```

4. **Implement in new app** using the documentation from all agents

---

### Workflow 2: Understanding a Complex Feature

1. **Get feature overview**:
   ```
   @features-expert Explain how [feature] works across the app
   ```

2. **Deep dive on specific aspects**:
   - Mobile UX → `@legacy-mobile-expert`
   - Web responsive → `@legacy-web-expert`
   - Data layer → `@packages-expert`

---

### Workflow 3: Debugging or Enhancing

1. **Understand current implementation**:
   ```
   @features-expert How does [feature] currently work?
   ```

2. **Check data constraints**:
   ```
   @packages-expert What validation rules apply to [entity]?
   ```

3. **Review UI patterns**:
   ```
   @legacy-mobile-expert What components are used for [interaction]?
   ```

---

## Best Practices

### Do's
✅ **Be specific** - "Document the MWList component" vs "Tell me about lists"
✅ **Reference concrete examples** - "Show me the calendar screen implementation"
✅ **Ask for comparisons** - "Compare legacy tag management with new implementation"
✅ **Request code references** - "Include file paths and line numbers"
✅ **Chain agents** - Use multiple agents for comprehensive understanding

### Don'ts
❌ **Don't be vague** - "How does the app work?" is too broad
❌ **Don't assume** - Let agents read actual code, don't assume implementation
❌ **Don't skip agents** - Use the right specialist for each task
❌ **Don't ask for implementation** - These agents analyze and document, not implement (that's your job with their help)

---

## Agent Outputs

Each agent provides structured documentation including:

- **Code references** - Exact file paths and line numbers
- **Visual design** - Colors (hex codes), spacing (px), typography
- **Data structures** - TypeScript interfaces, field descriptions
- **User workflows** - Step-by-step interaction flows
- **Business logic** - Validation rules, calculations, permissions
- **Migration guidance** - How to adapt to new app
- **Integration points** - Dependencies and relationships

---

## Maintenance

### Updating Agents

As the codebase evolves, you may need to update agent knowledge:

1. Edit the agent markdown file in `.claude/agents/`
2. Update the system prompt or guidelines
3. Add new tool access if needed
4. Test with sample queries

### Adding New Agents

To create a new specialized agent:

1. Copy an existing agent file as a template
2. Update the frontmatter (name, description, tools)
3. Customize the system prompt for the specialization
4. Document when to use it in this README
5. Test thoroughly

---

## Support

If an agent doesn't have the information you need:
1. Check if you're using the right agent (see decision tree above)
2. Make your question more specific
3. Try breaking down into smaller questions
4. Chain multiple agents for complex tasks

If you find gaps in agent knowledge:
- Update the agent's markdown file with better prompts
- Add references to key documentation
- Expand the "Key Files to Reference" section

---

## Quick Start Examples

```bash
# Start simple - explore what's available
claude /agents packages-expert "List all interfaces available in @ppa/interfaces"

# Analyze a specific feature
claude /agents features-expert "How does practice plan creation work?"

# Deep dive on implementation
claude /agents legacy-mobile-expert "Document all mobile-web components and their props"

# Compare implementations
claude /agents legacy-web-expert "Compare legacy responsive patterns with new app requirements"
```

---

**Remember**: These agents are documentation experts, not implementors. They help you understand the legacy app so you can build a better new one.
