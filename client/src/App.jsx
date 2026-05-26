import { useState } from "react"

import Login from "./pages/Login"
import Journal from "./pages/Journal"

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  )

  return (

    <div>

      {isLoggedIn ? (
        <Journal setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <Login setIsLoggedIn={setIsLoggedIn} />
      )}

    </div>

  )

}

export default App