import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, UserIcon, ArchiveIcon, FileEditIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200"
        >
          <div className="size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg ">
            <SparklesIcon className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Talent IQ
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${isActive("/problems")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          {/* DASHBOARD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${isActive("/dashboard")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          {/* ARCHIVE PAGE LINK */}
          <Link
            to={"/archive"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${isActive("/archive")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <ArchiveIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Archive</span>
            </div>
          </Link>

          {/* WORKSPACES LIST PAGE LINK */}
          <Link
            to={"/workspaces"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${isActive("/workspaces") || isActive("/workspace")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <FileEditIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Workspaces</span>
            </div>
          </Link>

          {/* PROFILE PAGE LINK */}
          <Link
            to={"/profile"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${isActive("/profile")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <UserIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Profile</span>
            </div>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="ml-2 mt-2">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
