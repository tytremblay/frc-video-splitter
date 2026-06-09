import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileWarningIcon } from 'lucide-react';

interface FileConflictDialogProps {
  open: boolean;
  conflictingPaths: string[];
  totalCount: number;
  onReplace: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

function basename(filepath: string) {
  return filepath.replace(/.*[\\/]/, '');
}

export function FileConflictDialog({ open, conflictingPaths, totalCount, onReplace, onSkip, onCancel }: FileConflictDialogProps) {
  const skipCount = totalCount - conflictingPaths.length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <FileWarningIcon className="size-4 text-amber-500" strokeWidth={1.75} />
            </div>
            <DialogTitle>
              {conflictingPaths.length === 1
                ? '1 file already exists'
                : `${conflictingPaths.length} files already exist`}
            </DialogTitle>
          </div>
          <DialogDescription>
            {skipCount > 0
              ? `${conflictingPaths.length} of ${totalCount} output files already exist. You can replace them, skip them and split the remaining ${skipCount}, or cancel.`
              : 'All output files already exist. You can replace them or cancel.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 bg-muted/20 px-3 py-2 space-y-1">
          {conflictingPaths.map((p) => (
            <p key={p} className="font-mono text-[11px] text-muted-foreground truncate" title={p}>
              {basename(p)}
            </p>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          {skipCount > 0 && (
            <Button variant="outline" size="sm" onClick={onSkip}>
              Skip existing
            </Button>
          )}
          <Button size="sm" onClick={onReplace}>
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
