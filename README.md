
# Security Control Center

A comprehensive web-based security management system for area-based personnel assignment and monitoring.

## Features

- **Employee Management**: Add, view, and manage security personnel with detailed profiles
- **Shift Management**: Support for 4 different shifts with automatic personnel filtering
- **Area-Based Assignments**: Organized gate assignments across 5 different security areas (NGL, YRD, BUP, HUH, YNT)
- **Drag & Drop Interface**: Intuitive drag-and-drop functionality for personnel assignments
- **Command Structure**: Dedicated supervisor and coordinator assignment system
- **Mobile Patrols**: Management of 8 mobile patrol units
- **Special Assignments**: Handle training, vacation, and other special duty assignments
- **Weapon Tracking**: Toggle weapon assignments for gates and patrols
- **Dark/Light Theme**: User-selectable theme with persistent settings
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## File Structure

```
security-control-center/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with responsive design
├── script.js           # Full application logic and functionality
└── README.md           # This documentation file
```

## Installation

1. Download all files to a folder on your computer
2. Open `index.html` in a web browser
3. The application will run locally without any server setup required

## Usage

### Adding Employees
1. Click the "Add Employee" button in the header
2. Fill in the employee details (name, age, grade code, badge, role, shift)
3. Submit the form to add the employee to the system

### Managing Shifts
- Use the shift selector buttons to switch between different shifts
- Personnel assignments are automatically filtered by the selected shift

### Assigning Personnel
- Drag employees from the "Available Personnel" pool
- Drop them onto specific gates, patrol units, or special assignments
- The system automatically prevents over-capacity assignments

### Command Structure
- Assign supervisors and coordinators for each shift
- Delete personnel using the trash icon on employee cards

### Weapon Management
- Click the gun icon on gate/patrol cards to toggle weapon assignments
- Visual indicators show which positions have weapons assigned

### Theme Switching
- Use the sun/moon toggle in the header to switch between light and dark themes
- Theme preference is automatically saved in browser storage

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Internet Explorer 11+

## Technical Details

- **Pure HTML/CSS/JavaScript**: No external frameworks or dependencies required
- **Local Storage**: Theme preferences are saved locally
- **Responsive Grid**: CSS Grid and Flexbox for modern layouts
- **Font Awesome Icons**: Icons loaded from CDN
- **Drag & Drop API**: Native HTML5 drag and drop implementation

## Security Areas

### NGL Area
- Regular Gates: G #1, G #2, G #3, G #21
- VIP Gates: V/P #05, V/P #014

### YRD Area  
- Regular Gates: G #16, G #17
- VIP Gates: V/P #07, V/P #011

### BUP Area
- Regular Gates: G #18
- VIP Gates: V/P #03

### HUH Area
- Regular Gates: G #23, G #24
- VIP Gates: V/P #022, V/P #023

### YNT Area
- Regular Gates: G #4, G #5, G #9, G #11
- VIP Gates: V/P #06, V/P #09, V/P #010

## Default Sample Data

The system includes sample employees for demonstration:
- John Smith (Supervisor, Shift 1)
- Sarah Johnson (Coordinator, Shift 1)
- Mike Wilson (Patrol, Shift 1)
- Lisa Brown (Guard, Shift 1)
- David Lee (Supervisor, Shift 2)
- Maria Garcia (Coordinator, Shift 2)

## Customization

The system can be easily customized by modifying:
- Gate areas and names in the `GATE_AREAS` configuration
- Color schemes in the CSS file
- Personnel roles and attributes in the JavaScript
- Capacity limits for different assignment types

## Support

This is a standalone application that runs entirely in the browser. No server setup or external dependencies are required.
