export default function formatUserName(profile: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!profile) return "User";
  const first = profile.first_name ? profile.first_name + " " : "";
  const last = profile.last_name || "User";
  return (first + last).trim();
} 