# Vela Spinners Admin – Production Upgrade

The original React/Vite CRM screens remain intact. A **Spinning Mill Production** sidebar section now provides Production Dashboard; Factory Masters; Mixing Recipes; Production Planning/Lots; Raw Material Lot Receipts; separate Mixing/Carding/Drawing/OE entry pages; Waste Recovery; Bag Packing; DC Bag Dispatch; Inter-Unit Transfers; Labour, EB, Quality, Costs, Downtime and reports.

Set `VITE_API_BASE_URL` in `.env` (see `.env.example`). From the frontend project directory run `npm install`, `npm run dev` for local development, and `npm run build` for production, on a supported Node version. Only packages required by the existing app remain in `package.json`. No package-lock or dependencies are included.

Configure factory masters, approved recipes, sales order lots and raw material inward first; stage entry screens deliberately use approved upstream stock balances rather than typed database IDs. Most new production operations use dedicated pages rather than modal dialogs. A machine/shift run must be submitted and verified before its manager-approved stock posting. Original CRM stock and dispatch continue to be available as before.

**Verification notice:** JSX parsing was checked locally. A complete Vite production build requires a local npm installation and must be run before deployment.
