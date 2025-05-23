import { Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Box, Container } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MeetingProvider } from "./context/MeetingContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import DashboardShimmer from "./components/UI/DashboardShimmer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewMeeting from "./pages/NewMeeting";
import MeetingDetails from "./pages/MeetingDetails";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/UI/ScrollToTop";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Copyright from "./pages/Copyright";
import OurTeam from "./pages/OurTeam";
import About from "./pages/About";

const Loading = () => (
  <Container maxWidth="sm" sx={{ py: 15, textAlign: "center" }}>
    <DashboardShimmer />
  </Container>
);

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const hideFooterPaths = ["/new-meeting", "/meeting"];

  const hideFooter = hideFooterPaths.some((path) =>
    location.pathname.startsWith(path)
  );
  return (
    <Box>
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-meeting"
            element={
              <PrivateRoute>
                <NewMeeting />
              </PrivateRoute>
            }
          />
          <Route
            path="/our-team"
            element={
              <PrivateRoute>
                <OurTeam />
              </PrivateRoute>
            }
          />
          <Route
            path="/about-us"
            element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            }
          />
          <Route
            path="/meeting/:id"
            element={
              <PrivateRoute>
                <MeetingDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <PrivateRoute>
                <Privacy />
              </PrivateRoute>
            }
          />
          <Route
            path="/terms"
            element={
              <PrivateRoute>
                <Terms />
              </PrivateRoute>
            }
          />
          <Route
            path="/cookie"
            element={
              <PrivateRoute>
                <Cookies />
              </PrivateRoute>
            }
          />
          <Route
            path="/copyright"
            element={
              <PrivateRoute>
                <Copyright />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      {!hideFooter && location.pathname !== "/" && <Footer />}
    </Box>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <MeetingProvider>
          <AppContent />
        </MeetingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
