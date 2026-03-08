---
name: essence-architecture
description: 'Guardian skill for ESSENCE architecture: enforce Clean Architecture layers, multi-tenant tenantId handling, visual Essence CSS vars and 4px rule, and PII consent logic. Use when designing, reviewing, or implementing features that touch domain, application, infrastructure, UI, or data schemas.'
argument-hint: 'Describe the feature or module to implement or review'
---

# Essence Architecture Guardian

## When to Use
- New feature design that spans domain, application, and infrastructure
- Code review for multi-tenant safety or PII handling
- UI or component work that must follow Essence visual standards
- Data schema or API changes that might include PII

## Procedure
1. **Classify the task**
   - Identify affected layers: domain, application, infrastructure, interfaces
   - Identify affected surfaces: UI, API, data schema, jobs, integrations
2. **Enforce Clean Architecture**
   - Domain: pure rules, entities, value objects, no framework imports
   - Application: use cases, orchestration, input/output ports
   - Infrastructure: DB, external services, adapters
   - Interfaces: controllers, routes, UI bindings
3. **Multi-tenant validation**
   - Ensure every query/command includes or validates `tenantId`
   - If `tenantId` is missing, define the source and enforce it at boundaries
   - Add tests for cross-tenant isolation when data is accessed
4. **Essence visual standard**
   - Use CSS variables (`--primary`, `--secondary`, etc.) for colors
   - Apply the 4px spacing rule for margins, paddings, radii, and grids
   - Reject hard-coded colors that bypass the theme system
5. **PII consent gate**
   - Detect PII fields (identity, health, contact)
   - Require a consent record for any schema with PII
   - Ensure APIs and UI flows record and validate consent before processing
6. **Quality checks**
   - Add or update tests for tenant boundaries and consent flows
   - Confirm no dependency violations across layers
   - Summarize risks and required follow-ups

## Critical Checks
- **PII Guard:** Every schema with Identity, Health, or Contact fields MUST have a corresponding consent record.
- **Tenant Isolation:** Reject any database query that does not include a `where { tenantId }` filter derived from JWT.
- **Visual Polish:** Any new UI component must use `var(--primary-glow)` for hover states to maintain brand depth.

## Output Format
- Architecture notes (layers, boundaries, dependencies)
- Tenant safety checklist results
- Essence UI compliance notes
- PII consent requirements and changes
- Test updates or gaps
