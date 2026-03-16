import { getSession } from "@/lib/session";
import { getAuthUrl } from "@/lib/strava";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const authUrl = getAuthUrl();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Strava Dashboard
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          Connect your Strava account to see your activity stats, trends, and performance insights.
        </p>
      </div>
      <a
        href={authUrl}
        className="flex items-center gap-3 bg-[#FC4C02] hover:bg-[#e34402] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg shadow-lg shadow-orange-500/20"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connect with Strava
      </a>
      <div className="mt-12 grid grid-cols-3 gap-8 text-center text-gray-500 text-sm">
        <div>
          <div className="text-2xl mb-1">📊</div>
          <div>Activity Charts</div>
        </div>
        <div>
          <div className="text-2xl mb-1">🏃</div>
          <div>Performance Stats</div>
        </div>
        <div>
          <div className="text-2xl mb-1">📈</div>
          <div>Weekly Trends</div>
        </div>
      </div>
    </div>
  );
}
