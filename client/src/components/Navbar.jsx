import { FaBell, FaSearch } from "react-icons/fa"

function Navbar() {
  return (
    <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-md mb-8">

      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-xl w-96">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search topics..."
          className="bg-transparent outline-none ml-3 w-full"
        />
      </div>

      <div className="flex items-center gap-5">

        <FaBell className="text-2xl text-gray-600 cursor-pointer" />

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h2 className="font-semibold">Vignesh</h2>
            <p className="text-sm text-gray-500">Student</p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Navbar