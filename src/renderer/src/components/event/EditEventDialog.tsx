import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditEvent } from './EditEvent';

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventDialog({ open, onOpenChange }: EditEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>
            Name, location, and dates for this recording.
          </DialogDescription>
        </DialogHeader>
        <EditEvent onEditingComplete={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
