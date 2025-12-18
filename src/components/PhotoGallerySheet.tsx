import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoGallerySheetProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  onDeletePhoto: (index: number) => void;
}

const PhotoGallerySheet = ({ isOpen, onClose, photos, onDeletePhoto }: PhotoGallerySheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Your Photos ({photos.length})</SheetTitle>
        </SheetHeader>
        
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <p className="text-lg font-medium">No photos yet</p>
            <p className="text-sm">Take or add photos to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[calc(80vh-100px)] pb-4">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={`${photo}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
                    onClick={() => onDeletePhoto(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PhotoGallerySheet;
