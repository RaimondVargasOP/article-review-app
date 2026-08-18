# Article Review App

A robust, client-side React application built with Vite and TypeScript for reviewing and editing articles.

## Setup & Execution

To run this project locally, ensure you have Node.js installed, then execute the following commands in your terminal:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Run the unit tests:**
   ```bash
   npm run test
   ```

## Design Decisions

- **Strict TypeScript & Minimal State**: The project strictly avoids the use of `any`. State is kept to an absolute minimum; filtered and sorted lists, as well as dynamic dropdown options, are derived automatically during rendering using `useMemo` to prevent unnecessary re-renders.

- **Separation of Concerns**: Data fetching logic (simulating network latency via localStorage), reusable UI components, and application state are strictly decoupled. `useEffect` is utilized exclusively for the initial asynchronous data load and external DOM synchronization (theme toggling), never for derived values.

- **Controlled Forms**: The edit interface utilizes a fully controlled React form, ensuring immediate validation feedback before submission without relying on external form libraries.

- **Native Theming**: The Light/Dark mode feature is implemented natively using CSS variables (`:root` and `[data-theme='dark']`) toggled via React, avoiding heavy UI frameworks and maintaining a small bundle size.

- **Responsive CSS Grid**: The layout relies on pure CSS Grid and Flexbox for responsiveness, allowing dynamic wrapping without the need for complex media queries.

## Known Limitations

- **Simulated Backend**: The application relies on asynchronous localStorage interactions to simulate a database. Data will not persist across different browsers or devices.

- **No Pagination**: For the scope of these 15 sample articles, all filtered results are rendered on a single page. In a real-world scenario with thousands of records, virtualization or pagination would need to be implemented in the grid component.

- **Authentication**: There is no user authentication or role-based access control; any user can edit the status and content of the articles.