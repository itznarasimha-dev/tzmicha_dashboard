import { useState, useEffect } from "react";
import { User, Bell, Shield, Palette, Camera, Loader2, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";
import { useAppStore } from "@/store/appStore";
import { useUpdateUser } from "@/hooks";
import { ROLE_LABELS } from "@/constants";
import { cn } from "@/utils";
import type { Theme } from "@/types";

const themeOptions: { value: Theme; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Clean white interface" },
  { value: "dark", label: "Dark", desc: "Easy on the eyes" },
  { value: "system", label: "System", desc: "Follows your OS" },
];

const notificationItems = [
  { label: "PR Review Requests", description: "When someone requests your review" },
  { label: "Bug Assignments", description: "When a bug is assigned to you" },
  { label: "Sprint Updates", description: "Sprint start, end, and velocity reports" },
  { label: "Leave Approvals", description: "When your leave request is approved or rejected" },
  { label: "Mentions", description: "When someone mentions you in a comment" },
];

const securityItems = [
  { label: "Two-Factor Authentication", description: "Add an extra layer of security", action: "Enable 2FA" },
  { label: "Change Password", description: "Last changed 3 months ago", action: "Update" },
  { label: "Active Sessions", description: "2 active sessions", action: "Manage" },
];

export function SettingsPage() {
  const { user: currentUser, theme, setTheme, loadMe } = useAppStore();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    title: currentUser?.title ?? '',
    department: currentUser?.department ?? '',
  });
  const [saved, setSaved] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({
      name: currentUser.name ?? '',
      email: currentUser.email ?? '',
      title: currentUser.title ?? '',
      department: currentUser.department ?? '',
    });
  }, [currentUser?.id]);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    updateUser({ id: currentUser.id, data: profileForm }, {
      onSuccess: (updatedUser) => {
        useAppStore.setState(s => ({ ...s, user: { ...s.user!, ...updatedUser } }));
        loadMe();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  }

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <PageHeader
        title="Settings"
        description="Manage your account and workspace preferences"
        breadcrumbs={[{ label: "Settings" }]}
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="size-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-3.5" /> Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="size-3.5" /> Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <AvatarCropModal
                open={cropOpen}
                onClose={() => setCropOpen(false)}
                userId={currentUser.id}
                onUploaded={(url) => {
                  useAppStore.setState(s => ({ ...s, user: s.user ? { ...s.user, avatar: url } : s.user }));
                  loadMe();
                }}
              />

              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-border">
                <div className="relative group cursor-pointer" onClick={() => setCropOpen(true)}>
                  <Avatar name={currentUser.name} src={currentUser.avatar ?? undefined} size="xl" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="size-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{ROLE_LABELS[currentUser.role]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentUser.email}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                  <Input label="Email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} type="email" />
                  <Input label="Job Title" value={profileForm.title} onChange={e => setProfileForm(p => ({ ...p, title: e.target.value }))} />
                  <Input label="Department" value={profileForm.department} onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))} />
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={isPending} className="flex items-center gap-2">
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how TZMicha looks for you</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] font-semibold text-foreground mb-4">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                      theme === t.value
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                        : "border-border hover:border-border-strong hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "size-8 rounded-md border border-border",
                      t.value === "light" ? "bg-white" : t.value === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-white to-gray-900"
                    )} />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what you want to be notified about</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {notificationItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer shrink-0">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-rose-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:size-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {securityItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-border-strong transition-colors">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <Button variant="outline" size="sm">{item.action}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
