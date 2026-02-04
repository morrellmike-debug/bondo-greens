export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="text-8xl font-bold text-white mb-8 p-12 rounded-full bg-gradient-to-br from-green-700 to-green-900 inline-block">
          🏌️
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-4">
          BONDO GREENS 2026
        </h1>
        
        <p className="text-2xl text-green-700 font-semibold mb-12">
          Registration Coming Soon
        </p>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 mb-10 border-2 border-green-200">
          <p className="text-lg text-gray-800 mb-6 font-medium">
            Join us for golf, food, awards, and great company!
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-base text-gray-700">
                <strong className="text-green-700 text-lg">Friday, May 15</strong><br />
                <span className="text-gray-600">10-hole Night Golf</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-base text-gray-700">
                <strong className="text-green-700 text-lg">Saturday, May 16</strong><br />
                <span className="text-gray-600">10-hole 2-Man Scramble Championship</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-base mt-12">
          Questions? Contact the organizers.
        </p>
      </div>
    </div>
  );
}
