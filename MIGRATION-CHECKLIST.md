# Practice Plan App - Page Migration Checklist

**Last Updated**: December 9, 2024

This document tracks the migration of individual pages from the LegacyApp to the new v10 app.

## 📊 Quick Status Overview

```
Overall Progress:   █████░░░░░░░░░░░░░░░ 21% (18 of 86 pages)

Mobile Pages:       █████░░░░░░░░░░░░░░░ 19% (9 of 48 pages)
Web Pages:          ██████░░░░░░░░░░░░░░ 24% (9 of 38 pages)

Active Work Items:  3
Available to Claim: 68
```

**🚨 Action Required:**
- **Multiple agents** currently working
- **68 pages** ready to be claimed
- **Priority:** Phase 1 Authentication pages (6 mobile + 3 web)

## Legend

- ✅ **Migrated** - Page fully implemented with UI and functionality
- 📋 **Placeholder** - Route file exists but needs implementation
- ⏸️ **Not Started** - No file created yet
- 🔄 **In Progress** - Currently being worked on

---

## 🔄 Active Work (Multi-Agent Coordination)

**Instructions for Agents:**
1. Before starting work, add an entry to the table below
2. Update your entry with progress notes and blockers
3. When complete, remove from this table and update the page status in the sections below
4. Check this section before starting new work to avoid conflicts

| Page/Feature | Platform | Agent/Developer | Started | Status/Notes | Blockers |
|--------------|----------|-----------------|---------|--------------|----------|
| Coaches List | Mobile | Claude-Main | 2024-12-09 | Starting implementation | None |
| Coaches List | Web | Claude-Main | 2024-12-09 | Starting implementation | None |
| Coach Detail | Mobile | Claude-Main | 2024-12-09 | Queued after list pages | None |
| Profile | Mobile | Agent-Claude-Profile | 2024-12-09 | Claiming and studying legacy implementation | None |
| Profile | Web | Agent-Claude-Profile | 2024-12-09 | Claiming and studying legacy implementation | None |
| Team Settings | Mobile | Agent-Claude-Team | 2024-12-09 | Studying legacy implementation | None |
| Team Settings | Web | Agent-Claude-Team | 2024-12-09 | Studying legacy implementation | None |
| Admin | Mobile | Agent-Claude-Admin | 2024-12-09 | Claiming work - studying legacy implementation | None |
| Admin | Web | Agent-Claude-Admin | 2024-12-09 | Claiming work - studying legacy implementation | None |
| Subscription | Mobile | Agent-Claude-Subscription | 2024-12-09 | Studying legacy implementation | None |
| Subscription | Web | Agent-Claude-Subscription | 2024-12-09 | Studying legacy implementation | None |
| Login | Mobile | Agent-Claude-Auth | 2024-12-09 | Studying legacy implementation | None |
| Login | Web | Agent-Claude-Auth | 2024-12-09 | Studying legacy implementation | None |
| Register | Mobile | Agent-Claude-Auth | 2024-12-09 | Studying legacy implementation | None |
| Register | Web | Agent-Claude-Auth | 2024-12-09 | Studying legacy implementation | None |
| Forgot Password | Mobile | Agent-Claude-ForgotPwd | 2024-12-09 | Claiming work - studying legacy | None |
| Forgot Password | Web | Agent-Claude-ForgotPwd | 2024-12-09 | Claiming work - studying legacy | None |

**How to Claim Work:**
1. Choose a page from the sections below (prioritize Phase 1-3 items)
2. Add a row to the table above with:
   - Page/Feature name
   - Platform (Mobile/Web/Both)
   - Your agent ID or name
   - Today's date
   - Brief status note
3. Mark the page status as 🔄 in the appropriate section below

**Example Entry:**
```
| Login Page | Mobile | Agent-ABC123 | 2024-12-09 | Implementing UI, 60% done | Need Firebase auth setup |
```

### 🤝 Multi-Agent Collaboration Guidelines

**DO:**
- ✅ Check the Active Work table before starting
- ✅ Claim your work by adding an entry to the table
- ✅ Update your status regularly (at least daily)
- ✅ Note any blockers that might affect other agents
- ✅ Communicate dependencies (e.g., "Needs auth slice completed first")
- ✅ Work on different platforms (one agent on mobile, another on web)
- ✅ Complete one page fully before moving to the next
- ✅ Update the Completed Work Log when done

**DON'T:**
- ❌ Start work without claiming it in the Active Work table
- ❌ Work on a page already claimed by another agent
- ❌ Leave stale entries (remove if abandoning work)
- ❌ Skip updating page status (📋 → 🔄 → ✅)
- ❌ Work on dependent features out of order
- ❌ Make breaking changes to shared code without noting it

**Coordination Tips:**
- If you need something another agent is working on, note it in your Blockers column
- Similar pages can be worked in parallel (e.g., Tags mobile + Tags web)
- Core infrastructure (layouts, auth, state slices) should be completed first
- Test your changes on both platforms before marking complete

---

## Mobile Pages

### Authentication Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Login | `(auth)/login.tsx` | `login.tsx` | 🔄 |
| Register | `(auth)/register.tsx` | `register.tsx` | 🔄 |
| Email Sign-in | `(auth)/email-signin.tsx` | - | ⏸️ |
| Forgot Password | `(auth)/forgot-password.tsx` | - | ⏸️ |
| Passwordless | `(auth)/passwordless.tsx` | - | ⏸️ |
| Onboarding | `(auth)/onboarding.tsx` | - | ⏸️ |

### Main App Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Dashboard/Home | `(main)/(tabs)/index.tsx` | `dashboard.tsx` | ✅ |
| Calendar (Tab) | `(main)/(tabs)/calendar.tsx` | `calendar.tsx` | ✅ |
| Menu (Tab) | `(main)/(tabs)/menu.tsx` | - | ⏸️ |

### Practice Plans

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Plans List | - | `plans.tsx` | ✅ |
| Plan Detail | `(main)/plan/[id].tsx` | - | ⏸️ |
| Plan PDF View | `(main)/plan/[id]/pdf.tsx` | - | ⏸️ |
| Plan Share | `(main)/plan/[id]/share.tsx` | - | ⏸️ |
| New Plan | `(main)/plan/new.tsx` | - | ⏸️ |
| Plan Detail Modal | `(modals)/plan-detail.tsx` | - | ⏸️ |

### Templates

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Practice Templates List | `(main)/practice-templates.tsx` | `templates.tsx` | ✅ |
| Practice Template Detail | `(main)/practice-template-detail.tsx` | - | ⏸️ |
| Template Selector | `(main)/template-selector.tsx` | - | ⏸️ |

### Periods

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Period Templates List | `(main)/period-templates.tsx` | `periods.tsx` | ✅ |
| Period Template Detail | `(main)/period-template-detail.tsx` | - | ⏸️ |
| Period Selector | `(main)/period-selector.tsx` | - | ⏸️ |

### Activities

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Activity Edit | `(main)/activity-edit.tsx` | - | ⏸️ |

### Tags

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Tags List | `(main)/tags.tsx` | `tags.tsx` | ✅ |
| Tag Detail | `(main)/tag-detail.tsx` | `tag-detail.tsx` | 📋 |

### Coaches

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Coaches List | `(main)/coaches.tsx` | `coaches.tsx` | 📋 |
| Coach Detail | `(main)/coach-detail.tsx` | - | ⏸️ |

### Files

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Files List | `(main)/files.tsx` | `files.tsx` | ✅ |
| File Detail | `(main)/file-detail.tsx` | - | ⏸️ |

### Announcements

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Announcements List | `(main)/announcements.tsx` | `announcements.tsx` | ✅ |
| Announcement Detail | `(main)/announcement-detail.tsx` | - | ⏸️ |

### Reports

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Reports | `(main)/reports.tsx` | `reports.tsx` | ✅ |

### Team & Settings

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Team Settings | `(main)/team-settings.tsx` | `team.tsx` | ✅ |
| Profile | `(main)/profile.tsx` | `profile.tsx` | 🔄 |
| Subscription | `(main)/subscription.tsx` | `subscription.tsx` | 📋 |
| Admin | `(main)/admin.tsx` | `admin.tsx` | 📋 |
| Contact | `(main)/contact.tsx` | - | ⏸️ |

### Other Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Notes View | `(main)/notes-view.tsx` | - | ⏸️ |
| Help | - | `help.tsx` | ✅ |
| Index/Root | `index.tsx` | `index.tsx` | 📋 |

### System Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Root Layout | `_layout.tsx` | `_layout.tsx` | ✅ |
| Auth Layout | `(auth)/_layout.tsx` | - | ⏸️ |
| Main Layout | `(main)/_layout.tsx` | - | ⏸️ |
| Tabs Layout | `(main)/(tabs)/_layout.tsx` | - | ⏸️ |
| Not Found | `+not-found.tsx` | - | ⏸️ |
| HTML Template | `+html.tsx` | - | ⏸️ |
| Modal | `modal.tsx` | - | ⏸️ |

---

## Web Pages

### Marketing/Public Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Landing Page | `(marketing)/page.tsx` | `index.web.tsx` | 📋 |
| About | `(marketing)/about/page.tsx` | - | ⏸️ |
| Blog | `(marketing)/blog/page.tsx` | - | ⏸️ |
| Contact | `(marketing)/contact/page.tsx` | - | ⏸️ |
| Directors | `(marketing)/directors/page.tsx` | - | ⏸️ |
| Features | `(marketing)/features/page.tsx` | - | ⏸️ |
| For Coaches | `(marketing)/for-coaches/page.tsx` | - | ⏸️ |
| Pricing | `(marketing)/pricing/page.tsx` | - | ⏸️ |
| Privacy | `(marketing)/privacy/page.tsx` | - | ⏸️ |
| Terms | `(marketing)/terms/page.tsx` | - | ⏸️ |

### Authentication Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Login | `(auth)/login/page.tsx` | - | 🔄 |
| Register | `(auth)/register/page.tsx` | - | 🔄 |
| Forgot Password | `(auth)/forgot-password/page.tsx` | - | ⏸️ |
| Mobile Auth | `auth/mobile/page.tsx` | - | ⏸️ |

### Main App Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Dashboard | `dashboard/page.tsx` | `dashboard.web.tsx` | ✅ |
| Calendar | `calendar/page.tsx` | `calendar.web.tsx` | ✅ |
| Menu | `menu/page.tsx` | - | ⏸️ |

### Practice Plans

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Practice Plans List | `practice/page.tsx` | `plans.web.tsx` | ✅ |
| Plan Edit | `plan/[id]/edit/page.tsx` | - | ⏸️ |
| Plan Share View | `share/[token]/page.tsx` | - | ⏸️ |

### Templates & Periods

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Templates List | `templates/page.tsx` | `templates.web.tsx` | ✅ |
| Periods List | `periods/page.tsx` | `periods.web.tsx` | ✅ |

### Tags

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Tags List | `tags/page.tsx` | `tags.web.tsx` | ✅ |

### Coaches

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Coaches List | `coaches/page.tsx` | `coaches.web.tsx` | 📋 |

### Files

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Files List | `files/page.tsx` | `files.web.tsx` | ✅ |

### Announcements

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Announcements List | `announcements/page.tsx` | `announcements.web.tsx` | ✅ |

### Reports

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Reports | `reports/page.tsx` | `reports.web.tsx` | ✅ |

### Team & Settings

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Team Settings | `team/page.tsx` | `team.web.tsx` | ✅ |
| Profile | `profile/page.tsx` | `profile.web.tsx` | 🔄 |
| Subscription | `subscription/page.tsx` | - | ⏸️ |
| Admin | `admin/page.tsx` | - | ⏸️ |

### Other Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Notes | `notes/page.tsx` | - | ⏸️ |
| Help | `help/page.tsx` | `help.web.tsx` | ✅ |
| Support | `support/page.tsx` | - | ⏸️ |

### System Pages

| Page | Legacy Path | New Path | Status |
|------|-------------|----------|:------:|
| Root Layout | `layout.tsx` | `_layout.web.tsx` | ✅ |
| Auth Layout | `(auth)/layout.tsx` | - | ⏸️ |
| Marketing Layout | `(marketing)/layout.tsx` | - | ⏸️ |

---

## Summary Statistics

### Mobile Pages
- **Total Pages**: 48
- **Migrated (✅)**: 9 (19%)
- **Placeholder (📋)**: 12 (25%)
- **Not Started (⏸️)**: 27 (56%)

### Web Pages
- **Total Pages**: 38
- **Migrated (✅)**: 9 (24%)
- **Placeholder (📋)**: 3 (8%)
- **Not Started (⏸️)**: 26 (68%)

### Overall
- **Total Pages**: 86
- **Migrated (✅)**: 18 (21%)
- **Placeholder (📋)**: 15 (17%)
- **Not Started (⏸️)**: 53 (62%)

---

## ✅ Completed Work Log

This section tracks completed migrations for historical reference and velocity tracking.

| Page/Feature | Platform | Agent/Developer | Completed Date | Notes |
|--------------|----------|-----------------|----------------|-------|
| Root Layout | Mobile | Initial Setup | 2024-12-09 | Foundation layout implemented |
| Root Layout | Web | Initial Setup | 2024-12-09 | Foundation layout implemented |
| Tags List | Mobile | Agent-Claude-Tags | 2024-12-09 | Mobile version was pre-implemented, verified working |
| Tags List | Web | Agent-Claude-Tags | 2024-12-09 | Full implementation with modals and table view |
| Files List | Mobile | Agent-Claude-Files | 2024-12-09 | Full implementation with folder navigation, search, upload/delete triggers |
| Files List | Web | Agent-Claude-Files | 2024-12-09 | Desktop table view with folder navigation, favorites, download, delete |
| Announcements List | Mobile | Agent-Claude-Announcements | 2024-12-09 | Full list view with priority badges, pinned status, read/unread tracking |
| Announcements List | Web | Agent-Claude-Announcements | 2024-12-09 | Desktop view with search, sort, create/edit/delete modals, pin/unpin functionality |
| Plans List | Mobile | Agent-Claude-Plans | 2024-12-09 | Today's practice view with live timer, session tracking, activity list, FAB, delete confirmation |
| Plans List | Web | Agent-Claude-Plans | 2024-12-09 | Mobile-web list of today's + upcoming plans with navigation to calendar |
| Help | Mobile | Agent-Claude-Help | 2024-12-09 | Comprehensive FAQ, contact links, app info, expandable Q&A |
| Help | Web | Agent-Claude-Help | 2024-12-09 | Full help center with collapsible FAQs, resource links, app information |
| Reports | Mobile | Agent-Claude-Reports | 2024-12-09 | Analytics dashboard with stat cards, top periods breakdown, recent practices list |
| Reports | Web | Agent-Claude-Reports | 2024-12-09 | Full analytics with tabs (Periods/Tags), date range filter, usage tables with progress bars |
| Templates List | Mobile | Agent-Claude-Files | 2024-12-09 | Practice templates list with search, empty states, period counts |
| Templates List | Web | Agent-Claude-Files | 2024-12-09 | Desktop table view with edit, duplicate, delete actions |
| Team Settings | Mobile | Agent-Claude-Team | 2024-12-09 | Edit team name/sport, color picker for branding, logo upload/delete, view/edit modes |
| Team Settings | Web | Agent-Claude-Team | 2024-12-09 | Grid layout with logo, team info, color display, edit modal with color pickers |
| Calendar | Mobile | Agent-Claude-Calendar | 2024-12-09 | Week/month toggle, month grid component, week view with day headers, practice cards, FAB, delete confirmation |
| Calendar | Web | Agent-Claude-Calendar | 2024-12-09 | Today's + upcoming plans list (2 weeks), empty states, create/view actions |
| Dashboard | Mobile | Agent-Claude-Dashboard | 2024-12-09 | Navigation screen with welcome header, quick stats, feature cards using brand colors |
| Dashboard | Web | Agent-Claude-Dashboard | 2024-12-09 | Full functional dashboard with stats (upcoming, hours, coaches, templates), today's practices, quick actions, upcoming practices section |
| Periods List | Mobile | Agent-Claude-Periods | 2024-12-09 | Period templates list with search, duration/notes display, empty states, TPFooterButtons |
| Periods List | Web | Agent-Claude-Periods | 2024-12-09 | Desktop table view with create/edit/delete modals, duration and notes columns, success toasts |

**Velocity Tracking:**
- Week of Dec 9, 2024: 24 pages completed (2 layouts + 2 tags + 2 files + 2 announcements + 2 plans + 2 help + 2 reports + 2 templates + 2 team + 2 calendar + 2 dashboard + 2 periods)
- Total Completed: 24 pages
- Remaining: 62 pages
- Average: N/A (just started)

---

## Migration Priorities

### Phase 1: Core Authentication (Current)
**Mobile:**
- Login
- Register
- Forgot Password

**Web:**
- Login
- Register
- Forgot Password

### Phase 2: Main App Structure
**Mobile:**
- Dashboard/Home
- Calendar Tab
- Menu Tab
- Root layouts

**Web:**
- Dashboard
- Landing page improvements
- Root layouts

### Phase 3: Practice Plans (Core Feature)
**Mobile:**
- Plan Detail
- New Plan
- Plan PDF View
- Plan Share

**Web:**
- Plan Edit
- Plan Share View

### Phase 4: Templates & Periods
**Mobile:**
- Practice Template Detail
- Template Selector
- Period Template Detail
- Period Selector
- Activity Edit

**Web:**
- (Already have placeholder pages)

### Phase 5: Content Management
**Mobile:**
- Tag Detail
- Coach Detail
- File Detail
- Announcement Detail
- Notes View

**Web:**
- (Already have placeholder pages)

### Phase 6: Marketing & Public Pages (Web Only)
- About
- Blog
- Contact
- Features
- For Coaches
- Pricing
- Privacy
- Terms

---

## Notes

1. **Placeholder pages exist** for most core features but need full implementation
2. **Mobile has more detail pages** (modals/screens) than web
3. **Web has marketing pages** that mobile doesn't need
4. **Layouts are critical** - need to implement auth layouts, main layouts, and tab layouts for mobile
5. **System pages** like error boundaries, 404 pages, and loading states are missing
6. Some features in LegacyApp may be **combined or simplified** in v10

---

**Next Steps:**
1. Complete authentication pages (mobile + web)
2. Implement core layouts and navigation
3. Migrate plan detail and editing functionality
4. Work through features in priority order
