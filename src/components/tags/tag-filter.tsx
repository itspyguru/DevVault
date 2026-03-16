import { TagBadge } from "./tag-badge";
import { useTagsStore } from "@/stores/tags-store";

export function TagFilter() {
  const { allTags, selectedTags, toggleTag, clearTags } = useTagsStore();

  if (allTags.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {selectedTags.length > 0 && (
        <button
          onClick={clearTags}
          className="text-[11px] px-2 py-0.5 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          Clear
        </button>
      )}
      {allTags.map((tag) => (
        <TagBadge
          key={tag}
          tag={tag}
          active={selectedTags.includes(tag)}
          onClick={() => toggleTag(tag)}
        />
      ))}
    </div>
  );
}
