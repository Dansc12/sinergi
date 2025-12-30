import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagInput = ({
  tags,
  onTagsChange,
  placeholder = "Add tag...",
  maxTags = 10,
}: TagInputProps) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    const processed = newTag.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (processed && !tags.includes(processed) && tags.length < maxTags) {
      onTagsChange([...tags, processed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      {/* Tag Input Row */}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={newTag}
          onChange={(e) => {
            const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
            setNewTag(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          className="flex-1 h-9 bg-muted/50 border-0 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddTag}
          disabled={!newTag.trim() || tags.length >= maxTags}
          className="h-9"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
