"use client"

import * as React from "react"
import fmLogo from "../../icon/fmlogo.png"
import {
  Loader2,
  Moon,
  Package,
  Pencil,
  Search,
  Sun,
  X,
  Images,
  Users,
} from "lucide-react"
import { useEditMode } from "@/contexts/EditModeContext"
import { useTheme } from "@/hooks/use-theme"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Schedule",
      url: "#",
      icon: Users,
      color: "hsl(var(--accent-indigo))",
      isActive: false,
      items: [
        {
          title: "Rooster",
          url: "#",
          page: "rooster",
        },
      ],
    },
    {
      title: "Vending Machine",
      url: "#",
      icon: Package,
      color: "hsl(var(--accent-emerald))",
      isActive: false,
      items: [
        {
          title: "Route List",
          url: "#",
          page: "route-list",
        },
        {
          title: "Location",
          url: "#",
          page: "deliveries",
        },
        {
          title: "Custom",
          url: "#",
          page: "custom",
        },

      ],
    },
    {
      title: "Gallery",
      url: "#",
      icon: Images,
      color: "hsl(var(--accent-pink))",
      isActive: false,
      items: [
        {
          title: "Plano VM",
          url: "#",
          page: "plano-vm",
        },
        {
          title: "Album",
          url: "#",
          page: "gallery-album",
        },
      ],
    },
  ],
  settingsItems: [
    { title: "Font",        page: "settings-appearance-font" },
    { title: "Route Colours", page: "settings-route-colors" },
    { title: "Storage",     page: "settings-storage" },
    { title: "Security",    page: "settings-security" },
  ],
}

const SETTINGS_PAGES = new Set([
  "settings-profile",
  "settings-appearance-font","settings-route-colors","settings-storage","settings-security",
])


export function AppSidebar({ 
  onNavigate,
  currentPage,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  onNavigate?: (page: string) => void
  currentPage?: string
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [settingsOpen, setSettingsOpen] = React.useState(() => SETTINGS_PAGES.has(currentPage ?? ""))
  const [openNavItem, setOpenNavItem] = React.useState<string | null>(null)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = React.useState(false)
  const [isEditModeTransitioning, setIsEditModeTransitioning] = React.useState(false)
  const { isEditMode, setIsEditMode, hasUnsavedChanges, saveChanges, isSaving, discardChanges } = useEditMode()
  const { mode, toggleMode } = useTheme()

  const text = {
    searchPlaceholder: "Search...",
    noResults: "No results found",
    tryDifferentKeyword: "Try a different keyword",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    editMode: "Edit Mode",
    switching: "Switching...",
    unsavedTitle: "Unsaved Changes",
    unsavedDescription: "You have unsaved changes. What would you like to do before turning off Edit Mode?",
    discardChanges: "Discard Changes",
    saveAndTurnOff: "Save & Turn Off",
    saving: "Saving...",
  }

  // Mutually exclusive: opening a Main submenu closes Settings, and vice versa
  const handleNavItemChange = (item: string | null) => {
    setOpenNavItem(item)
    if (item !== null) setSettingsOpen(false)
  }

  const handleSettingsOpenChange = (open: boolean) => {
    setSettingsOpen(open)
    if (open) setOpenNavItem(null)
  }

  const applyEditModeChange = (nextValue: boolean) => {
    setIsEditModeTransitioning(true)
    window.setTimeout(() => {
      setIsEditMode(nextValue)
      setIsEditModeTransitioning(false)
    }, 260)
  }

  const handleEditModeToggle = () => {
    if (isEditModeTransitioning) return
    if (isEditMode && hasUnsavedChanges) {
      setUnsavedDialogOpen(true)
    } else {
      applyEditModeChange(!isEditMode)
    }
  }

  const filteredNavMain = React.useMemo(() => {
    if (!searchQuery.trim()) return data.navMain
    const q = searchQuery.toLowerCase()
    return data.navMain
      .map(item => {
        const titleMatch = item.title.toLowerCase().includes(q)
        const filteredSubs = item.items?.filter(sub => sub.title.toLowerCase().includes(q)) ?? []
        if (titleMatch) return item
        if (filteredSubs.length > 0) return { ...item, items: filteredSubs }
        return null
      })
      .filter(Boolean) as typeof data.navMain
  }, [searchQuery])

  const settingsHasMatch = React.useMemo(() => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      "settings".includes(q) ||
      data.settingsItems.some(i => i.title.toLowerCase().includes(q)) ||
      text.darkMode.toLowerCase().includes(q) ||
      text.lightMode.toLowerCase().includes(q) ||
      text.editMode.toLowerCase().includes(q) ||
      "appearance".includes(q) || "edit".includes(q)
    )
  }, [searchQuery])

  const noResults = searchQuery.trim().length > 0 && filteredNavMain.length === 0 && !settingsHasMatch

  const handleNavClick = (_itemTitle: string) => {
    // top-level items with children just expand/collapse — no navigation
  }

  const handleSubItemClick = (page: string) => {
    onNavigate?.(page)
  }

  return (
    <>
    <Sidebar
      {...props}
    >
      <div className="flex flex-col h-full min-h-0">
      <SidebarHeader className="border-b border-border/60 px-0 pb-2">
        <div className="w-full px-4 py-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-center">
              <img
                src={fmLogo}
                alt="FM logo"
                className="w-full max-w-[98px] object-contain"
              />
            </div>
          </div>
      </SidebarHeader>
      <div className="relative mt-3 mb-4 px-3 sidebar-search-wrapper">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none transition-colors" />
        <input
          type="text"
          placeholder={text.searchPlaceholder}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="sidebar-search h-11 w-full rounded-full border border-input bg-background pl-11 pr-9 text-xs md:text-sm shadow-none outline-none ring-0 transition-all duration-200 placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-ring"
          aria-label="Search sidebar"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <SidebarContent>
        <Separator className="my-2" />
        <NavMain
          items={filteredNavMain}
          onItemClick={handleNavClick}
          onSubItemClick={handleSubItemClick}
          searchQuery={searchQuery}
          currentPage={currentPage}
          openItem={openNavItem}
          onOpenItemChange={handleNavItemChange}
        />
        <NavProjects
          settingsItems={data.settingsItems}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={handleSettingsOpenChange}
          currentPage={currentPage}
          onNavigate={onNavigate}
          searchQuery={searchQuery}
        />
        {noResults && (
          <div className="flex flex-col items-center gap-1.5 py-6 px-3 text-center animate-in fade-in duration-200">
            <span className="text-xl">🔍</span>
            <p className="text-xs font-medium text-muted-foreground">{text.noResults}</p>
            <p className="text-[11px] text-muted-foreground/60">{text.tryDifferentKeyword}</p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border/60 pt-3">
        <div className="grid gap-2 px-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleMode}
            className="justify-between"
          >
            <span>{mode === "dark" ? "Dark mode" : "Light mode"}</span>
            {mode === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={handleEditModeToggle}
            className="justify-between"
          >
            <span>{isEditMode ? "Editing" : "Edit mode"}</span>
            {isEditModeTransitioning ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
          </Button>
        </div>
        <p className="mt-3 px-2 text-[11px] text-muted-foreground/80">
          Tip: use Ctrl+B to toggle the sidebar quickly.
        </p>
      </SidebarFooter>
      </div>{/* end z-10 content wrapper */}
    </Sidebar>

      {/* Unsaved Changes Dialog */}
      <Dialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{text.unsavedTitle}</DialogTitle>
            <DialogDescription>
              {text.unsavedDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                discardChanges()
                setUnsavedDialogOpen(false)
                setIsEditMode(false)
              }}
            >
              {text.discardChanges}
            </Button>
            <Button
              onClick={async () => {
                await saveChanges()
                setUnsavedDialogOpen(false)
                setIsEditMode(false)
              }}
              disabled={isSaving}
            >
              {isSaving ? text.saving : text.saveAndTurnOff}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
