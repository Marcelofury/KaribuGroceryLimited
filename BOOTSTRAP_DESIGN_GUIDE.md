# Bootstrap 5 Design Pattern Explanation - KGL Application

## Overview
All HTML files have been converted to use **Bootstrap 5.3.2** exclusively, with no custom CSS files required.

---

## **LAYOUT COMPONENTS**

### **1. Container System**
- `container`: Fixed-width responsive container (max-width at breakpoints)
- `container-fluid`: Full-width container (100% width at all breakpoints)
- `row`: Creates horizontal groups of columns
- `col-*`: Column sizing (col-md-6 = 6 columns on medium+ screens)

### **2. Grid System** (12-column layout)
- `col-`: Equal width columns
- `col-md-6`: 6 columns (50% width) on medium+ screens
- `col-xl-3`: 3 columns (25% width) on extra-large screens
- `col-12`: Full width (100%) on all screens
- `g-4`: Gap/gutter spacing between columns (level 4)

---

## **NAVIGATION COMPONENTS**

### **3. Navbar (Header)**
- `navbar`: Main navigation bar component
- `navbar-expand-lg`: Responsive collapse at large screens
- `navbar-dark`: Dark text/styling for dark backgrounds
- `navbar-light`: Light text/styling for light backgrounds
- `bg-primary`: Primary color background (blue by default)
- `navbar-brand`: Logo/brand element
- `navbar-text`: Regular text in navbar
- `navbar-nav`: Navigation menu container

### **4. Nav Pills/Tabs (Sub-navigation)**
- `nav`: Navigation wrapper
- `nav-pills`: Pill-style navigation buttons
- `nav-item`: Individual navigation item
- `nav-link`: Navigation link styling
- `active`: Highlights current/active page

---

## **CARD COMPONENTS** (Stats, Sections, Content Boxes)

### **5. Card Structure**
- `card`: Container for card component
- `card-header`: Top section of card (title area)
- `card-body`: Main content area with padding
- `card-footer`: Bottom section of card
- `border-0`: Remove card border
- `shadow-sm`: Small box shadow for elevation
- `shadow`: Medium box shadow
- `shadow-lg`: Large box shadow
- `h-100`: Height 100% (makes all cards same height in row)

### **6. Card Variants**
- `border-success`: Green border
- `border-primary`: Blue border
- `bg-light`: Light gray background
- `bg-white`: White background

---

## **FORM COMPONENTS**

### **7. Form Controls**
- `form-label`: Styled label for form inputs
- `form-control`: Standard text input styling (consistent size, borders)
- `form-select`: Styled select dropdown
- `form-text`: Helper text below inputs
- `form-check`: Checkbox/radio wrapper
- `invalid-feedback`: Red error message styling
- `valid-feedback`: Green success message styling

### **8. Form Layouts**
- `mb-3`: Margin bottom (spacing between form groups)
- `w-100`: Width 100% (full width element)
- `w-auto`: Auto width (content-based sizing)

---

## **BUTTON COMPONENTS**

### **9. Button Styles**
- `btn`: Base button class (required for all buttons)
- `btn-primary`: Primary colored button (blue)
- `btn-secondary`: Secondary colored button (gray)
- `btn-success`: Green button
- `btn-danger`: Red button
- `btn-warning`: Yellow button
- `btn-info`: Cyan button
- `btn-light`: Light gray button
- `btn-dark`: Dark button
- `btn-outline-*`: Outline/ghost button variants
- `btn-sm`: Small button size
- `btn-lg`: Large button size

---

## **TABLE COMPONENTS**

### **10. Table Styling**
- `table`: Base table class
- `table-striped`: Alternating row background colors
- `table-hover`: Hover effect on rows
- `table-bordered`: Add borders to all cells
- `table-responsive`: Horizontal scroll on small screens
- `table-light`: Light gray header/row background
- `thead-light`: Light gray table header
- `align-middle`: Vertical center alignment in cells

---

## **BADGE COMPONENTS** (Status Indicators, Tags)

### **11. Badge Styles**
- `badge`: Base badge class
- `bg-success`: Green badge (positive/successful)
- `bg-danger`: Red badge (negative/error)
- `bg-warning`: Yellow badge (warning/caution)
- `bg-info`: Cyan badge (informational)
- `bg-secondary`: Gray badge (neutral)
- `bg-primary`: Blue badge (primary)
- `rounded-pill`: Pill-shaped badge (fully rounded)

---

## **LIST GROUP** (Structured Lists)

### **12. List Group Structure**
- `list-group`: Container for list
- `list-group-item`: Individual list item
- `list-group-flush`: Remove outside borders
- `active`: Highlight active item
- `disabled`: Grayed out disabled item

---

## **ALERT COMPONENTS** (Messages, Notifications)

### **13. Alert Styles**
- `alert`: Base alert class
- `alert-success`: Green success message
- `alert-danger`: Red error message
- `alert-warning`: Yellow warning message
- `alert-info`: Blue informational message
- `d-none`: Display none (hidden)

---

## **SPACING UTILITIES**

### **14. Margin Classes**
- `m-0` to `m-5`: Margin all sides (0=none, 5=largest)
- `mt-*`: Margin top
- `mb-*`: Margin bottom
- `ms-*`: Margin start (left in LTR)
- `me-*`: Margin end (right in LTR)
- `mx-*`: Margin horizontal (left + right)
- `my-*`: Margin vertical (top + bottom)
- `m-auto`: Auto margin (centering)

### **15. Padding Classes**
- `p-0` to `p-5`: Padding all sides
- `pt-*`: Padding top
- `pb-*`: Padding bottom
- `ps-*`: Padding start (left)
- `pe-*`: Padding end (right)
- `px-*`: Padding horizontal
- `py-*`: Padding vertical

---

## **FLEXBOX UTILITIES**

### **16. Flexbox Layout**
- `d-flex`: Enable flexbox display
- `flex-row`: Flex items in row (default)
- `flex-column`: Flex items in column
- `justify-content-between`: Space items evenly with space between
- `justify-content-center`: Center items horizontally
- `justify-content-end`: Align items to end
- `align-items-center`: Center items vertically
- `align-items-start`: Align items to top
- `align-items-end`: Align items to bottom
- `flex-grow-1`: Item grows to fill available space
- `ms-auto`: Push item to right (margin-start: auto)

---

## **TYPOGRAPHY UTILITIES**

### **17. Text Styling**
- `text-center`: Center align text
- `text-start`: Left align text
- `text-end`: Right align text
- `text-muted`: Gray text color
- `text-primary`: Primary color text (blue)
- `text-success`: Green text
- `text-danger`: Red text
- `text-warning`: Yellow text
- `text-white`: White text
- `fw-bold`: Bold font weight
- `fw-normal`: Normal font weight
- `fw-light`: Light font weight
- `fs-1` to `fs-6`: Font sizes (1=largest, 6=smallest)
- `display-1` to `display-6`: Display headings (extra large)
- `small`: Smaller text element

### **18. Text Decoration**
- `text-decoration-none`: Remove underline from links
- `text-decoration-underline`: Add underline
- `link-primary`: Primary colored link
- `link-secondary`: Secondary colored link

---

## **COLOR UTILITIES**

### **19. Background Colors**
- `bg-primary`: Primary color background (blue)
- `bg-secondary`: Secondary color (gray)
- `bg-success`: Green background
- `bg-danger`: Red background
- `bg-warning`: Yellow background
- `bg-info`: Cyan background
- `bg-light`: Light gray background
- `bg-dark`: Dark background
- `bg-white`: White background

### **20. Text Colors**
- `text-primary`: Blue text
- `text-secondary`: Gray text
- `text-success`: Green text
- `text-danger`: Red text
- `text-warning`: Yellow text
- `text-muted`: Muted gray text

---

## **DISPLAY UTILITIES**

### **21. Visibility**
- `d-none`: Display none (hidden)
- `d-block`: Display block
- `d-inline`: Display inline
- `d-inline-block`: Display inline-block
- `d-flex`: Display flex
- `d-grid`: Display grid
- `d-*-none`: Hide at specific breakpoint (d-md-none = hide on medium+)

### **22. Breakpoint Suffixes**
- `-sm`: Small devices (≥576px)
- `-md`: Medium devices (≥768px)
- `-lg`: Large devices (≥992px)
- `-xl`: Extra large devices (≥1200px)
- `-xxl`: Extra extra large devices (≥1400px)

---

## **BORDER UTILITIES**

### **23. Borders**
- `border`: Add border all sides
- `border-top`: Top border only
- `border-bottom`: Bottom border only
- `border-start`: Left border
- `border-end`: Right border
- `border-0`: Remove all borders
- `border-primary`: Primary colored border
- `border-success`: Green border
- `rounded`: Rounded corners
- `rounded-pill`: Fully rounded (pill shape)
- `rounded-circle`: Circular shape

---

## **SIZING UTILITIES**

### **24. Width**
- `w-25`: Width 25%
- `w-50`: Width 50%
- `w-75`: Width 75%
- `w-100`: Width 100%
- `w-auto`: Auto width
- `mw-100`: Max width 100%

### **25. Height**
- `h-25`: Height 25%
- `h-50`: Height 50%
- `h-75`: Height 75%
- `h-100`: Height 100%
- `min-vh-100`: Minimum height 100% of viewport height

---

## **POSITION UTILITIES**

### **26. Positioning**
- `position-relative`: Relative positioning
- `position-absolute`: Absolute positioning
- `position-fixed`: Fixed positioning
- `position-sticky`: Sticky positioning
- `top-0`, `bottom-0`, `start-0`, `end-0`: Position at edge

---

## **PRACTICAL EXAMPLES**

### **Example 1: Stat Card**
```html
<div class="col-md-6 col-xl-3">
    <div class="card h-100 border-0 shadow-sm">
        <div class="card-body">
            <div class="d-flex align-items-center">
                <div class="fs-1 me-3">💰</div>
                <div class="flex-grow-1">
                    <h6 class="card-title text-muted mb-1">Total Revenue</h6>
                    <div class="fs-4 fw-bold">UGX 100M</div>
                    <small class="text-muted">This Month</small>
                    <div class="mt-2"><span class="badge bg-success rounded-pill">↑ 18.5%</span></div>
                </div>
            </div>
        </div>
    </div>
</div>
```

**Explanation:**
- `col-md-6 col-xl-3`: 2 columns on medium, 4 columns on extra-large screens
- `card h-100`: Card with full height
- `border-0 shadow-sm`: No border, subtle shadow
- `d-flex align-items-center`: Flexbox with vertical centering
- `fs-1`: Large font size for emoji
- `me-3`: Margin end (right) spacing
- `flex-grow-1`: Content fills remaining space
- `badge bg-success rounded-pill`: Green pill-shaped badge

### **Example 2: Responsive Table**
```html
<div class="table-responsive">
    <table class="table table-hover table-striped align-middle mb-0">
        <thead class="table-light">
            <tr>
                <th>Product</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Maize</strong></td>
                <td>UGX 1,800</td>
            </tr>
        </tbody>
    </table>
</div>
```

**Explanation:**
- `table-responsive`: Horizontal scroll on small screens
- `table-hover`: Row hover effect
- `table-striped`: Alternating row colors
- `align-middle`: Vertically center content
- `table-light`: Light gray header background

### **Example 3: Form Group**
```html
<div class="mb-3">
    <label for="username" class="form-label">Username</label>
    <input type="text" class="form-control" id="username" placeholder="Enter username" required>
    <div class="invalid-feedback d-block" id="usernameError"></div>
</div>
```

**Explanation:**
- `mb-3`: Margin bottom for spacing
- `form-label`: Bootstrap label styling
- `form-control`: Input field styling
- `invalid-feedback d-block`: Error message (always visible)

---

## **KEY ADVANTAGES OF BOOTSTRAP-ONLY DESIGN**

1. **Consistency**: All components follow the same design system
2. **Responsiveness**: Mobile-first design that adapts to all screen sizes
3. **Accessibility**: Built-in ARIA attributes and keyboard navigation
4. **Maintenance**: No custom CSS to maintain or debug
5. **Speed**: Faster development with pre-built components
6. **Documentation**: Extensive official Bootstrap documentation available
7. **Browser Compatibility**: Tested across all major browsers
8. **Theme Customization**: Can customize colors/styles via Bootstrap variables

---

## **COMMON PATTERNS USED IN KGL APPLICATION**

1. **Navbar Header**: `navbar navbar-expand-lg navbar-dark bg-primary`
2. **Navigation Pills**: `nav nav-pills` with `nav-link active`
3. **Stat Cards**: `card h-100 shadow-sm` with flexbox layout
4. **Data Tables**: `table table-hover table-striped table-responsive`
5. **Form Inputs**: `form-label` + `form-control` + `invalid-feedback`
6. **Buttons**: `btn btn-primary w-100` (full width primary button)
7. **Badges**: `badge bg-success rounded-pill` (success indicator)
8. **Grid Layout**: `row g-4` with `col-md-*` columns

---

## **FILES CONVERTED**

✅ **Auth Pages** (2 files)
- [login.html](auth/login.html)
- [registration.html](auth/registration.html)

✅ **Director Pages** (2 files)
- [director-dashboard.html](director/director-dashboard.html)
- director-reports.html

**Manager Pages** (7 files)
- manager-dashboard.html
- procure.html
- stock.html
- sales.html
- prices.html
- credit-sales.html
- reports.html

**Sales Agent Pages** (5 files)
- sales-agent-dashboard.html
- agent-make-sale.html
- agent-stock-view.html
- agent-prices.html
- agent-my-sales.html

---

## **CDN LINKS USED**

```html
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap 5 JS Bundle (includes Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

The JS bundle is needed for interactive components like dropdowns, modals, tooltips, and collapse functionality.

---

## **NEXT STEPS**

1. ✅ Remove custom CSS files (`css/login.css`, `css/dashboard.css`)
2. Test all pages for responsiveness on different screen sizes
3. Customize Bootstrap colors if needed (via CSS variables or Sass)
4. Add interactive JavaScript functionality as needed
5. Consider Bootstrap Icons for additional icon needs

---

**End of Documentation**
