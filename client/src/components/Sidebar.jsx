import { useNavigate } from "react-router-dom"

function Sidebar() {

  const navigate = useNavigate()

  const handleLogout = () => {

    localStorage.removeItem("token")

    navigate("/login")

  }

  return (

    <div className="w-64 min-h-screen bg-purple-700 text-white p-6">

      <h1 className="text-3xl font-bold mb-10">
        NeuroLoop 🧠
      </h1>

      <div className="space-y-4">

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-left bg-purple-600 hover:bg-purple-500 p-4 rounded-xl transition-all"
        >
          Dashboard 📊
        </button>

        <button
          onClick={() => navigate("/journal")}
          className="w-full text-left bg-purple-600 hover:bg-purple-500 p-4 rounded-xl transition-all"
        >
          Journal ✍️
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-left bg-red-500 hover:bg-red-400 p-4 rounded-xl transition-all"
        >
          Logout 🚪
        </button>

      </div>

    </div>

  )

}

export default Sidebar