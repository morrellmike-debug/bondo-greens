export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl font-bold text-white mb-4">🏌️</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          BONDO GREENS 2026
        </h1>
        <p className="text-xl text-green-100 mb-6">
          Registration Coming Soon
        </p>
        <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-8 text-white">
          <p className="text-base mb-3">
            Join us for golf, food, awards, and great company!
          </p>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Friday, May 15</strong><br />
              10-hole Night Golf
            </p>
            <p>
              <strong>Saturday, May 16</strong><br />
              10-hole 2-Man Scramble Championship
            </p>
          </div>
        </div>
        <a
          href="https://dev.bondogreens.com"
          className="inline-block bg-white text-green-700 font-bold py-3 px-8 rounded-lg hover:bg-green-50 transition"
        >
          View Dev Site
        </a>
        <p className="text-green-100 text-sm mt-8">
          Questions? Contact the organizers.
        </p>
      </div>
    </div>
  );
}
