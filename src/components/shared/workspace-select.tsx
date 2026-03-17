import { useWorkspaceStore } from "@/stores/workspace-store";

interface WorkspaceSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function WorkspaceSelect({ value, onChange, className, style }: WorkspaceSelectProps) {
  const { workspaces } = useWorkspaceStore();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={style}
    >
      <option value="">No workspace</option>
      {workspaces.map((ws) => (
        <option key={ws.id} value={ws.name}>{ws.name}</option>
      ))}
    </select>
  );
}
