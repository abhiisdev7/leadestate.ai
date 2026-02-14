import { Link, Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  contacts: "Contacts",
  campaigns: "Campaigns",
  conversation: "Conversation",
  appointments: "Appointments",
  insights: "Insights",
}

function useBreadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: { path: string; label: string }[] = [{ path: "/", label: ROUTE_LABELS[""] ?? "Home" }]
  let acc = ""
  for (const seg of segments) {
    acc += `/${seg}`
    crumbs.push({ path: acc, label: ROUTE_LABELS[seg] ?? seg })
  }
  return crumbs
}

export default function RootLayout() {
  const crumbs = useBreadcrumbs()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.flatMap((crumb, i) => [
                  ...(i > 0 ? [<BreadcrumbSeparator key={`sep-${crumb.path}`} />] : []),
                  <BreadcrumbItem key={crumb.path}>
                    {i < crumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.path}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>,
                ])}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}