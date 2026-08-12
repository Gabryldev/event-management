import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-ink text-paper">

      {/* HERO */}
      <section className="relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-20 right-[-150px] w-[500px] h-[500px] rounded-full bg-amber/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="min-h-[calc(100vh-64px)] flex items-center">

            <div className="max-w-4xl py-20">

              {/* Eyebrow */}
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-[2px] bg-amber" />

                <p className="text-amber uppercase tracking-[5px] text-xs font-semibold">
                  The modern way to experience events
                </p>
              </div>

              {/* Main heading */}
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight">

                Moments worth

                <span className="block text-amber">
                  showing up for.
                </span>

              </h1>

              {/* Description */}
              <p className="mt-8 text-paper/65 text-lg md:text-xl max-w-2xl leading-relaxed">
                Discover exceptional events, secure your place effortlessly,
                and turn ordinary days into unforgettable experiences.
                Your next great memory starts here.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-4 mt-10">

                {/* Browse */}
                <Link
                  to="/events"
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    px-6
                    py-3.5
                    rounded-xl
                    bg-amber
                    text-ink
                    font-semibold
                    hover:scale-[1.02]
                    transition
                    shadow-lg
                  "
                >
                  Explore Events

                  <span className="text-xl group-hover:translate-x-1 transition">
                    →
                  </span>
                </Link>

                {/* LOGIN */}
                <Link
                  to="/login"
                  className="
                    px-6
                    py-3.5
                    rounded-xl
                    border
                    border-paper/30
                    text-paper
                    font-semibold
                    hover:border-amber
                    hover:text-amber
                    transition
                  "
                >
                  Login
                </Link>

                {/* SIGN UP */}
                <Link
                  to="/register"
                  className="
                    px-6
                    py-3.5
                    rounded-xl
                    border
                    border-paper/30
                    text-paper
                    font-semibold
                    hover:border-amber
                    hover:text-amber
                    transition
                  "
                >
                  Create an account
                </Link>

              </div>

              {/* FEATURES */}
              <div className="mt-20 pt-8 border-t border-paper/10">

                <div className="flex flex-wrap gap-x-10 gap-y-5 text-paper/55 text-sm">

                  <div className="flex items-center gap-3">
                    <span className="text-amber text-lg">◈</span>
                    Secure ticketing
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber text-lg">▣</span>
                    Digital QR tickets
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber text-lg">✦</span>
                    Curated experiences
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber text-lg">✓</span>
                    Easy event discovery
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;