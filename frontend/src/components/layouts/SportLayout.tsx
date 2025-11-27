import { ReactNode, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/animated-sidebar";
import { Trophy, Activity, Target, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SportLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-wicky-green rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-wicky-green whitespace-pre"
      >
        Wicky Sports
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-wicky-green rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

export const SportLayout = ({ children, sidebar }: SportLayoutProps) => {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Cricket",
      href: "/cricket",
      icon: <Trophy className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "NBA",
      href: "/nba",
      icon: <Activity className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "EPL",
      href: "/epl",
      icon: <Target className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "AFL",
      href: "/afl",
      icon: <Trophy className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "NRL",
      href: "/nrl",
      icon: <Activity className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-background w-full flex-1 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Sport-specific sidebar content */}
            {sidebar && (
              <div className="mt-6 pt-6 border-t border-sidebar-border">
                {sidebar}
              </div>
            )}
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 overflow-auto">
        <div className="w-full h-full bg-background">
          {children}
        </div>
      </div>
    </div>
  );
};
