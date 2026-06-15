export default function Success() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">Success</div>
        <h1 className="text-3xl font-black mb-4">Welcome to FenceQuoteHQ Pro!</h1>
        <p className="text-slate-400 mb-8">
          Your subscription is active. You now have full access to the Bid Builder, Material Takeoff Pro, and Proposal PDF generator.
        </p>
        
        <a href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 font-bold hover:bg-orange-600 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}
