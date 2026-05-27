import { useState } from "react"
import axios from "axios"

import { useNavigate } from "react-router-dom"

function Signup() {

  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name,
          email,
          password,
        }
      )

      alert(response.data.message)

      setName("")
      setEmail("")
      setPassword("")

      navigate("/login")

    } catch (error) {

      console.log(error)

      alert("Signup Failed")

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-blue-200">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-[400px]">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Create Account 🚀
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border rounded-xl outline-none"
          />

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
            onClick={handleSignup}
            className="w-full bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-all"
          >
            Create Account
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gray-200 p-4 rounded-xl"
          >
            Back To Login
          </button>

        </div>

      </div>

    </div>

  )

}

export default Signup