import { FaHome, FaBook, FaChartBar, FaCog } from "react-icons/fa"

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow-lg p-6">

      <h1 className="text-3xl font-bold text-purple-600 mb-10">
        NeuroLoop
      </h1>

      <div className="space-y-6">

        <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 cursor-pointer">
          <FaHome />
          <span>Dashboard</span>
        </div>

        <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 cursor-pointer">
          <FaBook />
          <span>Journal</span>
        </div>

        <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 cursor-pointer">
          <FaChartBar />
          <span>Analytics</span>
        </div>

        <div className="flex items-center gap-3 text-gray-700 hover:text-purple-600 cursor-pointer">
          <FaCog />
          <span>Settings</span>
        </div>

      </div>

    </div>
  )
}

export default Sidebar