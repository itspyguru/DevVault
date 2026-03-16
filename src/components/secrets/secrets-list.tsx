import { SecretCard } from "./secret-card";
import type { Secret } from "@/lib/tauri";

interface SecretsListProps {
  secrets: Secret[];
  onEdit: (secret: Secret) => void;
  onDelete: (id: string) => void;
}

export function SecretsList({ secrets, onEdit, onDelete }: SecretsListProps) {
  return (
    <div className="grid gap-3">
      {secrets.map((secret) => (
        <SecretCard
          key={secret.id}
          secret={secret}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
