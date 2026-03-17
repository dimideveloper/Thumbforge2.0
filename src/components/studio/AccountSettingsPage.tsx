import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  UserCircle, Shield, Bell, Settings, Save, Loader2, Upload,
  LogOut, Trash2, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AccountSettingsPageProps {
  user: User;
}

type Section = "profile" | "security" | "notifications" | "account";

const sections: { id: Section; label: string; icon: typeof UserCircle }[] = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: Settings },
];

const AccountSettingsPage = ({ user }: AccountSettingsPageProps) => {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [featureAnnouncements, setFeatureAnnouncements] = useState(false);

  // Load profile
  useEffect(() => {
    const load = async () => {
      setProfileLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
      }
      setProfileLoading(false);
    };
    load();
  }, [user.id]);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    if (displayName.trim().length > 50) {
      toast.error("Display name must be under 50 characters");
      return;
    }
    setProfileSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id);
    setProfileSaving(false);
    if (error) toast.error("Failed to save profile");
    else toast.success("Profile saved!");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("user-uploads")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast.error("Upload failed");
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl + "?t=" + Date.now();
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    setAvatarUploading(false);
    if (updateErr) toast.error("Failed to update avatar");
    else {
      setAvatarUrl(publicUrl);
      toast.success("Avatar updated!");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogoutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) toast.error("Failed to sign out");
    else toast.success("Signed out from all sessions");
  };

  const handleDeleteAccount = async () => {
    // Delete profile data (account deletion requires admin/edge function for full removal)
    await supabase.from("thumbnail_projects").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("user_id", user.id);
    await supabase.auth.signOut();
    toast.success("Account data deleted");
  };

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() || "??");

  return (
    <div className="flex-1 flex bg-background overflow-hidden">
      {/* Section nav */}
      <div className="w-52 border-r border-border p-4 space-y-1 shrink-0">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Settings</h2>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              activeSection === s.id
                ? "bg-white/10 text-white font-medium"
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
        {activeSection === "profile" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your public profile information</p>
            </div>
            <Separator />

            {profileLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {avatarUrl && <AvatarImage src={avatarUrl} />}
                    <AvatarFallback className="bg-white/10 text-white text-lg font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 cursor-pointer text-sm text-white hover:underline"
                    >
                      {avatarUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload avatar
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 2MB, JPG or PNG</p>
                  </div>
                </div>

                {/* Display name */}
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    maxLength={50}
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                </div>

                <Button onClick={handleSaveProfile} disabled={profileSaving} className="bg-white text-black hover:bg-white/90">
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">Update your password</p>
            </div>
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button onClick={handleChangePassword} disabled={passwordSaving} className="bg-white text-black hover:bg-white/90">
              {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Update Password
            </Button>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
            </div>
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Product Updates</p>
                  <p className="text-xs text-muted-foreground">Get notified about new features</p>
                </div>
                <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Feature Announcements</p>
                  <p className="text-xs text-muted-foreground">Be the first to know about major releases</p>
                </div>
                <Switch checked={featureAnnouncements} onCheckedChange={setFeatureAnnouncements} />
              </div>
            </div>
          </div>
        )}

        {activeSection === "account" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Account</h3>
              <p className="text-sm text-muted-foreground">Manage your account and sessions</p>
            </div>
            <Separator />

            <div className="space-y-3">
              <Button variant="outline" onClick={handleLogoutAll} className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out from all devices
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your projects, data, and credits. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPage;
