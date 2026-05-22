function Journal() {
  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Daily Learning Journal ✍️
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-md">

        <div className="mb-6">

          <label className="block mb-2 font-semibold">
            Topic
          </label>

          <input
            type="text"
            placeholder="Enter topic..."
            className="w-full p-4 border rounded-xl outline-none"
          />

        </div>

        <div className="mb-6">

          <label className="block mb-2 font-semibold">
            Notes
          </label>

          <textarea
            rows="10"
            placeholder="Write what you learned today..."
            className="w-full p-4 border rounded-xl outline-none"
          />

        </div>

        <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all">
          Save Journal
        </button>

      </div>

    </div>
  )
}

export default Journal