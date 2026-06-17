import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Appointments } from "@/pages/Appointments";
import { Customers } from "@/pages/Customers";
import { Services } from "@/pages/Services";
import { Staff } from "@/pages/Staff";
import { Inventory } from "@/pages/Inventory";
import { Statistics } from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
