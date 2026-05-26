import { useState } from "react"
import axios from "axios"

function Login({ setIsLoggedIn }) {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      )

      localStorage.setItem(
        "token",
        response.data.token
      )

      alert(response.data.message)

      setIsLoggedIn(true)

    } catch (error) {

      console.log(error)

      alert("Login Failed")

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-[400px]">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Login 🔐
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border rounded-xl outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-xl outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all"
          >
            Login
          </button>

        </div>

      </div>

    </div>

  )

}

export default Login