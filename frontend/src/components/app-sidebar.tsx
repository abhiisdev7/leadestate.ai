import * as React from "react"
import { Link } from "react-router-dom"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Calendar03Icon,
  ChartRingIcon,
  Home,
  Home02Icon,
  Message01Icon,
  PieChartIcon,
  SentIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const data = {
  user: {
    name: "abhilash",
    email: "abhilashkumar.ofc@gmail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <HugeiconsIcon icon={Home02Icon} strokeWidth={2} />,
      isActive: true,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: <HugeiconsIcon icon={UserMultiple02Icon} strokeWidth={2} />,
    },
    {
      title: "Conversation",
      url: "/conversation",
      icon: <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />,
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: <HugeiconsIcon icon={SentIcon} strokeWidth={2} />,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />,
    },
    {
      title: "Insights",
      url: "/insights",
      icon: <HugeiconsIcon icon={ChartRingIcon} strokeWidth={2} />,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <HugeiconsIcon icon={ChartRingIcon} strokeWidth={2} />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <HugeiconsIcon icon={SentIcon} strokeWidth={2} />,
    },
  ],
  projects: [
    {
      name: "Leads",
      url: "/contacts",
      icon: <HugeiconsIcon icon={UserMultiple02Icon} strokeWidth={2} />,
    },
    {
      name: "Campaigns",
      url: "/campaigns",
      icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HugeiconsIcon icon={Home} strokeWidth={2} className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Leadestate</span>
                  <span className="truncate text-xs">AI Agent</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
