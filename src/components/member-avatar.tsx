import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Member } from "@/lib/types";

export function MemberAvatar({ member, size = "sm" }: { member: Member; size?: "sm" | "md" }) {
  const initials = member.name.slice(0, 2);
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return (
    <Avatar className={sizeClass}>
      <AvatarFallback style={{ backgroundColor: member.color, color: "#fff" }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
