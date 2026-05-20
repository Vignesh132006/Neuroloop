import Sidebar from "../components/Sidebar"
import Heatmap from "../components/Heatmap"
import RevisionPanel from "../components/RevisionPanel"
import ProgressChart from "../components/ProgressChart"
import Navbar from "../components/Navbar"

function Dashboard() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-10">

        <Navbar />

        <h1 className="text-4xl font-bold mb-6">
          Welcome Back 👋
        </h1>

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-gray-500">Study Hours</h2>
            <p className="text-3xl font-bold mt-2">45h</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-gray-500">Streak</h2>
            <p className="text-3xl font-bold mt-2">14 Days 🔥</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-gray-500">Topics</h2>
            <p className="text-3xl font-bold mt-2">32</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-gray-500">Average Score</h2>
            <p className="text-3xl font-bold mt-2">78%</p>
          </div>

        </div>
        <Heatmap />
        <RevisionPanel />
        <ProgressChart />
      </div>

    </div>
  )
}

export default Dashboard
