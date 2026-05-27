import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Journal from "./pages/Journal"

function App() {

  const token = localStorage.getItem("token")

  return (

    <Routes>

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/journal"
        element={
          token ? (
            <Journal />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" />}
      />

    </Routes>

  )

}

export default App